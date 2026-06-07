# Developer Guide — Side Clock

[← README に戻る](./README.md)

Chrome拡張機能 Side Clock の開発者向けドキュメントです。

---

## ファイル構成

```
side-clock/
├── manifest.json          # MV3 マニフェスト
├── extension-api.js       # Chrome / Firefox WebExtension API 互換ラッパー
├── content.js             # メインロジック（時計・天気・UI・ドラッグ）
├── content.css            # オーバーレイのスタイル
├── background.js          # Service Worker（天気キャッシュ・設定初期化）
├── tools/
│   └── build-firefox-package.js # Firefox 用 manifest/package 生成
├── popup/
│   ├── popup.html         # 設定ポップアップUI
│   ├── popup.js           # 設定の読み書き
│   └── popup.css          # ポップアップのスタイル
├── _locales/
│   ├── ja/messages.json   # 日本語i18n
│   └── en/messages.json   # 英語i18n
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## アーキテクチャ

### content.js — IIFE でグローバル汚染を防止

```
SideClock() IIFE
├── init()                  # storage から設定読み込み → mountOverlay()
├── mountOverlay(target)    # DOM挿入・時計開始・天気スケジュール
├── updateClock()           # 毎秒: 時刻・日付描画 → applyFontSizes() → updateRing()
├── applyFontSizes()        # Canvas二分探索でフォントサイズ算出（はみ出し防止）
├── updateRing()            # SVG stroke-dasharray で60秒プログレスリング更新
├── setupCornerNav()        # 角移動ボタンのクリックハンドラ登録
├── moveToCorner(pos)       # top/left ピクセル変換 → CSSトランジション → 角CSS復元
├── makeDraggable()         # sc-grip の mousedown → onDrag → stopDrag
└── scheduleWeather()       # background へ GET_WEATHER メッセージ → renderWeather()
```

### background.js — Background worker / script

Chrome では `manifest.json` の `background.service_worker` として動作する。Firefox は MV3 でも `background.service_worker` ではなく `background.scripts` を使うため、`tools/build-firefox-package.js` で `dist/firefox/manifest.json` を生成する。

```
onMessage(GET_WEATHER)
└── storage.sync から登録地点の緯度経度を取得
    ├── 未登録 → null 返却（天気は非表示）
    └── 登録済 → storage.session キャッシュ確認（同一座標・TTL 15分）
                 ├── HIT  → キャッシュ返却
                 └── MISS → Open-Meteo API fetch → storage.session 保存 → 返却
```

---

## 重要な設計判断

### Chrome / Firefox API 互換

`extension-api.js` が `browser.*`（Firefox の Promise API）と `chrome.*`（Chrome の callback API）を吸収し、各スクリプトは `scExt` 経由で storage / tabs / runtime / i18n を呼び出す。

```js
const s = await scExt.getStorage('sync', DEFAULT_SETTINGS);
await scExt.setStorage('sync', { enabled: true });
const res = await scExt.sendRuntimeMessage({ type: 'GET_WEATHER' });
```

Chrome 用 manifest は content script に `extension-api.js` を先に注入し、service worker の `background.js` は `importScripts('extension-api.js')` で読み込む。Firefox 用 manifest は background scripts を `["extension-api.js", "background.js"]` に変換する。

### フルスクリーン検知の2モード

| モード | 検知方法 | overlay の position | 親要素 |
|---|---|---|---|
| HTML5 fullscreen | `fullscreenchange` イベント | `absolute` | `fullscreenElement` |
| F11 ブラウザ | `resize` + `innerHeight >= screen.availHeight` | `fixed` | `document.body` |

HTML5フルスクリーン時はスタッキングコンテキストが分離されるため、`fullscreenElement` の直接の子として追加しないとオーバーレイが見えなくなる。

### フォントサイズのはみ出し防止

`applyFontSizes()` は常に Canvas 二分探索で上限を算出し、手動設定値もその上限でクランプする。

```js
const maxFit = measureFitSize(text, overlayWidth - PADDING_H * 2 - 4);
baseSize = settings.autoFit ? maxFit : Math.min(userFontSize, maxFit);
```

Canvas の `measureText()` は CSS の `letter-spacing` を考慮しないため、等幅フォントに切り替えてその問題を解消している（`letter-spacing` 未使用）。

### pointer-events の設計

- `.sc-overlay`: `pointer-events: none`（ページ操作を妨げない）
- `.sc-grip`: 通常は `pointer-events: none`、ホバー中/ドラッグ中のみ `auto`（ドラッグ操作）
- `.sc-cnav`: 通常は `pointer-events: none`、ホバー中/ドラッグ中のみ `auto`（角移動クリック）
- `.sc-corner-nav`: `pointer-events: none`（コンテナは透過、ボタンのみ受け取る）

CSS `:hover` は `pointer-events: none` の親では発火しないため、`document.mousemove` でオーバーレイ矩形内のカーソル位置を判定し、`.sc-control-hover` を付与する。

### SVGリングアニメーション

角丸矩形を SVG `<path>` で描画し、`stroke-dasharray` で進行量を制御。

```js
// 現在の秒数に応じてダッシュ長を計算
const dash = perimeter * (seconds / 60);
prog.setAttribute('stroke-dasharray', `${dash} ${perimeter + 20}`);
```

`stroke-dasharray: 0 9999` で0秒（ちょうど0秒）のフラッシュを防止。

### コーナーナビの CSS 三角形

```
.sc-corner-nav { overflow: hidden; border-radius: 12px; }
  → 子要素がオーバーレイの角丸に沿ってクリップされる

.sc-cnav { clip-path: polygon(...); background: #4fc3f7; }
  → 正方形を斜めに切って水色三角タブに

.sc-cnav::before { clip-path: polygon(...); background: dark; }
  → 内側に小さなダーク三角インジケーター
```

---

## ストレージスキーマ

### `scExt.getStorage('sync')`（設定）

| キー | 型 | デフォルト | 説明 |
|---|---|---|---|
| `enabled` | boolean | `true` | オーバーレイ有効/無効 |
| `mode` | string | `'always'` | `'always'` / `'fullscreen'` |
| `position` | string | `'top-right'` | 4コーナーのいずれか |
| `weather` | boolean | `true` | 天気表示 |
| `unit` | string | `'C'` | `'C'` / `'F'` |
| `hour12` | boolean | `false` | AM/PM表示 |
| `autoFit` | boolean | `true` | フォント自動フィット |
| `overlayWidth` | number | `260` | オーバーレイ幅(px) |
| `customLeft` | number | `-1` | ドラッグ位置X（-1=未使用） |
| `customTop` | number | `-1` | ドラッグ位置Y（-1=未使用） |
| `weatherCountry` | string | `'JP'` | 郵便番号検索の国コード(ISO) |
| `weatherPostal` | string | `''` | 登録した郵便番号 |
| `weatherLat` | number\|null | `null` | 解決済み緯度（null=地点未登録） |
| `weatherLon` | number\|null | `null` | 解決済み経度 |
| `weatherPlace` | string | `''` | 登録地点の表示名 |

### `scExt.getStorage('session')`（天気キャッシュ）

| キー | 内容 |
|---|---|
| `sc_weather_cache` | Open-Meteo の現在天気レスポンスを整形した値。TTL 15分 |

---

## ローカルで試す

```bash
git clone https://github.com/165cm/side-clock.git
```

1. `chrome://extensions` を開く
2. **デベロッパーモード** をオン
3. **「パッケージ化されていない拡張機能を読み込む」** → `side-clock/` を選択
4. コード変更後は拡張機能カードの **🔄 ボタン** でリロード

### Firefox

```bash
node tools/build-firefox-package.js
```

1. `about:debugging#/runtime/this-firefox` を開く
2. **「一時的なアドオンを読み込む」** → `dist/firefox/manifest.json` を選択
3. コード変更後は再度 `node tools/build-firefox-package.js` を実行して、Firefox 側でリロード

---

## 天気API

[Open-Meteo](https://open-meteo.com/) を使用（無料・APIキー不要）。

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}&current_weather=true
```

送信するのは緯度・経度のみ。座標は端末の現在位置ではなく、ユーザーが設定で登録した地点を使う。

### 地点の登録（ジオコーディング）

設定ポップアップで「国／地域」＋「郵便番号」を入力して登録する。郵便番号→緯度経度の変換は [Zippopotam.us](https://www.zippopotam.us/)（無料・APIキー不要・多国対応）を使用。

```
GET https://api.zippopotam.us/{country}/{postalcode}
```

解決した緯度経度・地点名を `storage.sync`（`weatherLat` / `weatherLon` / `weatherPlace`）に保存する。地点が未登録（`weatherLat == null`）の場合、`GET_WEATHER` は `null` を返し天気は表示されない。`navigator.geolocation` は使用しない。

---

## i18n

`_locales/ja/messages.json`（デフォルト）と `_locales/en/messages.json` に対応。  
ポップアップの各要素は `data-i18n` 属性で自動置換される。

```js
scExt.i18nGetMessage('appSub') // → ニュース風オーバーレイ / News-style overlay
```
