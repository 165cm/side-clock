# Chrome ウェブストア 登録原稿（v1.3.0）

> 初回登録版 **v1.0.0** からの差分をすべて反映した、更新申請用の原稿です。
> 主な差分: ① `geolocation` 権限を削除（端末の現在位置取得を廃止） ② 郵便番号＋国による地点登録方式へ変更（グローバル対応） ③ `api.zippopotam.us` をホスト権限に追加 ④ 日本の郵便番号は3桁＋4桁の2ボックス入力 ⑤ 設定の即時反映とリロード案内を追加。

---

## 1. 基本情報

| 項目 | 内容 |
|---|---|
| 拡張機能名 | Side Clock |
| バージョン | 1.3.0 |
| カテゴリ | 仕事効率化（Productivity） |
| 言語 | 日本語 / English |
| 料金 | 無料 |

---

## 2. 概要（Summary / 132文字以内）

### 日本語
```
フルスクリーン動画に時計・天気・60秒リングをニュース番組風にオーバーレイ。郵便番号を登録するだけで天気を表示でき、端末の位置情報は取得しません。
```

### English
```
A news-style clock, weather and 60-second ring overlay for fullscreen video. Just register a postal code for weather — no device location access.
```

---

## 3. 詳細な説明（Detailed description）

### 日本語

```
■ Side Clock とは

YouTube や Netflix などのフルスクリーン再生中でも、ニュース番組のショルダー（画面隅の情報表示）のように、時計・天気・60秒プログレスリングをさりげなくオーバーレイ表示する Chrome 拡張機能です。動画を止めずに、別タブに切り替えずに、現在時刻と天気をサッと確認できます。

■ 主な機能

・時計オーバーレイ … HH:MM 表示。24時間／AM・PM を切り替え可能
・60秒プログレスリング … 枠が1分かけて一周し、秒の流れを直感的に把握
・天気表示（任意・オフがデフォルト） … 現在の天気アイコンと気温（℃／℉）を表示
・自由な配置 … 上部のグリップをドラッグして移動。4隅へのスナップにも対応
・フォント自動フィット … パネル幅に合わせて時刻の文字サイズを自動調整
・サイトごとの表示ON/OFF … 表示したくないサイトを個別に除外
・表示モード … 「常に表示」／「フルスクリーン時のみ」

■ 天気の使い方（位置情報は取得しません）

設定パネルで「国／地域」を選び「郵便番号」を登録するだけで、その地点の天気予報が表示されます。日本の郵便番号は「〒 ___ - ____」の2つの入力欄に分かれており、ハイフンを手入力する必要はありません。海外の郵便番号にも対応しています。

天気を表示するために端末の現在位置（GPS）を取得することは一切ありません。ユーザーが自分で登録した地点だけを使います。地点を未登録のうちは「地点を登録すると天気予報が表示されます」という案内が表示されます。

■ プライバシー

・端末の位置情報（GPS）は取得しません
・アカウント登録・ログインは不要です
・閲覧履歴やページの内容を収集・送信しません
・設定はお使いのブラウザ内にのみ保存され、Chrome の同期機能でご自身の端末間で同期されます
・天気の取得時のみ、登録地点の緯度経度を天気API（Open-Meteo）へ、郵便番号の照会時のみ「国＋郵便番号」を住所変換API（Zippopotam.us）へ送信します。いずれもアカウント不要・無料のAPIで、個人を特定する情報は送信しません

■ こんな方に

・フルスクリーンで動画を見ながら時刻を確認したい
・天気を別タブに切り替えずに把握したい
・時間を忘れて見すぎるのを防ぎたい
```

### English

```
■ What is Side Clock?

Side Clock overlays a clock, weather and a 60-second progress ring on top of any page — even during fullscreen playback on YouTube, Netflix and more — like the "shoulder" graphics on a news broadcast. Check the time and weather at a glance without pausing your video or switching tabs.

■ Features

・Clock overlay — HH:MM, switchable between 24-hour and AM/PM
・60-second progress ring — the border sweeps once per minute so you feel the seconds pass
・Weather (optional, off by default) — current condition icon and temperature (°C/°F)
・Free placement — drag the grip to move it; snaps to the four corners
・Auto-fit font — clock size adjusts to the panel width
・Per-site show/hide — exclude sites where you don't want the overlay
・Display modes — "Always" or "Fullscreen only"

■ Weather (no device location used)

Just pick a "Country/Region" and register a "Postal code" in the settings panel to see the forecast for that location. Japanese postal codes use two separate boxes (no hyphen typing needed); international postal codes are supported too.

Side Clock never accesses your device's GPS location. It only uses the location you register yourself. Until you register one, it simply shows a prompt explaining that registering a location will display the forecast.

■ Privacy

・No device location (GPS) is accessed
・No account or sign-in required
・No browsing history or page content is collected or transmitted
・Settings are stored only in your browser and synced across your own devices via Chrome sync
・Only when fetching weather, the registered coordinates are sent to a weather API (Open-Meteo); only when resolving a postal code, the "country + postal code" is sent to an address-lookup API (Zippopotam.us). Both are free, key-less APIs and no personally identifying information is sent
```

---

## 4. 更新内容（What's new — v1.0.0 → v1.3.0）

> ※ ストアの「最近の変更」欄、またはリリースノートにそのまま使えます。

### 日本語
```
v1.3.0 の変更点

・【プライバシー強化】端末の現在位置（GPS）の取得を完全に廃止しました
・【新機能】天気は設定から「国＋郵便番号」を登録する方式になり、海外の地点にも対応しました
・【使いやすさ】日本の郵便番号は3桁＋4桁の2つの入力欄に分割（ハイフン入力不要・自動でフォーカス移動）
・【新機能】地点を登録するまでは天気欄に登録を促す案内を表示します
・【改善】設定変更（天気のON/OFFなど）が対応ページへ即時反映されるようになりました
・【改善】設定を即時反映できないページ（拡張機能の更新前から開いていたタブなど）では、再読み込みを促す案内を表示します
```

### English
```
What's new in v1.3.0

・Privacy: removed all access to the device's current location (GPS)
・New: weather location is now set by registering a Country + Postal code in settings, with international support
・Easier input: Japanese postal codes use split 3-digit + 4-digit boxes (no hyphen needed, auto focus advance)
・New: shows a prompt to register a location until one is set
・Improved: setting changes (e.g. weather on/off) now apply live to supported pages
・Improved: shows a reload notice on pages where settings can't apply live (e.g. tabs opened before the update)
```

---

## 5. 単一用途の説明（Single purpose）

```
通常ページおよびフルスクリーン再生中の任意のウェブページに、時計・60秒プログレスリング・（任意で）天気を、ニュース番組のショルダー風のオーバーレイとして表示することが唯一の目的です。
```

```
The single purpose of this extension is to display a clock, a 60-second progress ring, and (optionally) weather as a news-style overlay on web pages, including during fullscreen playback.
```

---

## 6. 権限の正当性（Permission justifications）

> v1.0.0 から `geolocation` を**削除**し、`api.zippopotam.us` のホスト権限を**追加**しました。下表の「変更」列が初回登録版との差分です。

| 権限 | 用途の説明 | 変更 |
|---|---|---|
| `storage` | 時計形式・温度単位・表示位置・登録した天気地点・サイト別の表示設定などをブラウザに保存し、Chrome 同期でユーザー自身の端末間で引き継ぐために使用します。 | 継続 |
| `activeTab` | ポップアップを開いた際に現在のタブのドメインを取得し、「このサイトで表示／非表示」を切り替えること、および設定をそのページへ即時反映できるかを判定することに使用します。 | 継続 |
| `geolocation` | （旧版で使用）端末の現在位置取得に使用していましたが、**v1.3.0 で機能ごと廃止し、本権限を削除しました。** | ★削除 |
| ホスト権限 `https://api.open-meteo.com/*` | 登録地点の緯度経度をもとに現在の天気を取得するために使用します（APIキー不要の無料API）。 | 継続 |
| ホスト権限 `https://api.zippopotam.us/*` | ユーザーが入力した「国＋郵便番号」を緯度経度に変換するために使用します（APIキー不要の無料API）。 | ★追加 |

### 個別記入用テキスト（ストアのフォームに貼り付け）

**storage**
```
ユーザーの設定（時計形式、温度単位、オーバーレイの位置、登録した天気の地点、サイトごとの表示ON/OFF）を保存し、Chrome 同期でユーザー自身の端末間に引き継ぐために使用します。
```

**activeTab**
```
ポップアップ操作時に現在のタブのドメインを取得し、「このサイトで表示／非表示」の切り替えと、設定をそのページへ即時反映できるかの判定にのみ使用します。閲覧履歴やページ内容の収集は行いません。
```

**Host permission（api.open-meteo.com）**
```
ユーザーが登録した地点の緯度経度をもとに現在の天気情報を取得するために、無料・APIキー不要の Open-Meteo へリクエストを送信します。
```

**Host permission（api.zippopotam.us）**
```
ユーザーが設定画面で入力した国コードと郵便番号を緯度経度に変換するために、無料・APIキー不要の Zippopotam.us へリクエストを送信します。送信するのは国コードと郵便番号のみです。
```

---

## 7. データ使用に関する開示（Privacy practices）

- **リモートコードの使用**: なし（外部スクリプトの読み込み・eval 等は行いません）
- **収集・送信するデータ**:
  - 位置情報（ユーザーが入力した郵便番号、およびそれを変換した緯度経度）… 天気の取得・住所変換のためにのみ、Open-Meteo / Zippopotam.us へ送信。サーバー側に保存・販売は行いません。
  - 上記以外（個人情報・認証情報・閲覧履歴・ウェブ閲覧アクティビティ・ユーザー操作・個人的なやり取り 等）… **収集しません**
- **端末の現在位置（GPS）**: 取得しません（v1.3.0 で廃止）
- データの第三者への販売・譲渡: なし
- データの用途: 拡張機能の単一目的（時計・天気のオーバーレイ表示）に限定

### 開示文（コピペ用）
```
本拡張機能は、ユーザーが設定画面で登録した「国＋郵便番号」および、それを変換した緯度経度のみを、天気予報の取得（Open-Meteo）と郵便番号の住所変換（Zippopotam.us）の目的で送信します。これらは無料・APIキー不要のサービスであり、当該データはサーバーに保存されず、第三者に販売・譲渡されることもありません。端末の現在位置（GPS）は取得しません。アカウント登録・ログインは不要で、閲覧履歴やページ内容を収集することはありません。設定はブラウザ内にのみ保存されます。
```

---

## 8. その他の登録項目

| 項目 | 内容 |
|---|---|
| サポートサイト / ホームページ | https://165cm.github.io/portfolio/apps/side-clock |
| プライバシーポリシー URL | https://majestic-gateway-e4a.notion.site/Privacy-Policy-36ee8c4088938052b9b2c7c77b5799cc |
| スクリーンショット | フルスクリーン動画＋オーバーレイ表示／設定パネル（郵便番号登録UI）／4隅スナップ などを 1280×800 または 640×400 で用意 |

> 注意: `geolocation` を削除しているため、初回登録版のプライバシーポリシー本文に「現在位置の取得」に関する記述が残っている場合は、本原稿に合わせて修正してください（取得しない旨に統一）。
