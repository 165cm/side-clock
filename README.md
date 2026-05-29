# 🕐 Side Clock ![Tier](https://img.shields.io/badge/tier-T1-6366f1)

> フルスクリーン動画にニュース風の時計＆天気をオーバーレイ

![Chrome](https://img.shields.io/badge/Chrome-Extension-4fc3f7?logo=googlechrome&logoColor=white)
![Manifest](https://img.shields.io/badge/Manifest-V3-4fc3f7)
![License](https://img.shields.io/badge/License-MIT-4fc3f7)

---

## これは何？

YouTube や Netflix のフルスクリーン再生中に、時計・天気・60秒プログレスリングをニュース番組のショルダー風にオーバーレイ表示する Chrome 拡張機能です。  
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
