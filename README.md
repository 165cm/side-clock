# 🕐 Side Clock ![Tier](https://img.shields.io/badge/tier-T1-6366f1)

> フルスクリーン動画にニュース風の時計＆天気をオーバーレイ

![Chrome](https://img.shields.io/badge/Chrome-Extension-4fc3f7?logo=googlechrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-Add--on-4fc3f7?logo=firefoxbrowser&logoColor=white)
![Manifest](https://img.shields.io/badge/Manifest-V3-4fc3f7)
![License](https://img.shields.io/badge/License-MIT-4fc3f7)

---

## これは何？

YouTube や Netflix のフルスクリーン再生中に、時計・天気・60秒プログレスリングをニュース番組のショルダー風にオーバーレイ表示するブラウザ拡張機能です。
ドラッグ移動・4隅スナップ・フォント自動フィット対応で、邪魔にならずサッと確認できます。

## こんな時に使えます

- フルスクリーンで動画を見ながら現在時刻を確認したい
- 天気予報を別タブに切り替えずに把握したい
- 時間を忘れて見すぎてしまうのを防ぎたい

## 使い方

- 🌐 Chrome ウェブストア: *(審査中・近日公開予定)*
- インストール後、任意のページで自動的にオーバーレイが表示されます

**手動インストール（開発者向け）:**

1. このリポジトリをクローン: `git clone https://github.com/165cm/side-clock.git`
2. `chrome://extensions` を開く
3. 右上の **「デベロッパーモード」** をオン
4. **「パッケージ化されていない拡張機能を読み込む」** → `side-clock/` フォルダを選択

**Firefox 手動インストール（開発者向け）:**

Firefox は Manifest V3 の background 指定が Chrome と異なるため、Firefox 用パッケージを生成して読み込みます。

```bash
node tools/build-firefox-package.js
```

1. Firefox で `about:debugging#/runtime/this-firefox` を開く
2. **「一時的なアドオンを読み込む」** をクリック
3. `dist/firefox/manifest.json` を選択

| 操作 | 方法 |
|---|---|
| 移動する | 上部の **⠿ ⠿** をドラッグ |
| 角にスナップ | 4隅の **水色三角タブ** をクリック |
| 設定を変える | ツールバーの拡張機能アイコンをクリック |

## 技術・開発について

開発者向け情報（アーキテクチャ・ストレージスキーマ・設計判断）は [DEVELOPER.md](./DEVELOPER.md) を参照。

## ライセンス

MIT

## 関連リンク

- 🗂 ポートフォリオ: https://165cm.github.io/portfolio/apps/side-clock
- 🔒 [プライバシーポリシー](https://majestic-gateway-e4a.notion.site/Privacy-Policy-36ee8c4088938052b9b2c7c77b5799cc)
