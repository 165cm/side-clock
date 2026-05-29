# AI Coding Agent Guide

このリポジトリでの開発作法は、**中央マニュアル** に従ってください。

📘 中央マニュアル: https://github.com/165cm/portfolio/tree/main/docs/standards

- [tiers.md](https://github.com/165cm/portfolio/blob/main/docs/standards/tiers.md) — 作品ティア
- [commits.md](https://github.com/165cm/portfolio/blob/main/docs/standards/commits.md) — コミット規約
- [readme-template.md](https://github.com/165cm/portfolio/blob/main/docs/standards/readme-template.md) — README 規約
- [developer-template.md](https://github.com/165cm/portfolio/blob/main/docs/standards/developer-template.md) — DEVELOPER 規約
- [topics.md](https://github.com/165cm/portfolio/blob/main/docs/standards/topics.md) — Topics 規約
- [ops.md](https://github.com/165cm/portfolio/blob/main/docs/standards/ops.md) — その他運用ルール

## このリポジトリ固有の情報

- **Tier**: T1
- **Category**: tool
- **特有の制約**: Chrome 拡張 Manifest V3 / バニラ JS（ビルドツール不要）/ Service Worker の制約あり / Chrome ウェブストア審査基準に準拠

## このリポジトリでよく使うコマンド

```bash
# ビルドツール不要 — chrome://extensions で直接読み込み
# 1. chrome://extensions を開く
# 2. デベロッパーモード ON
# 3. 「パッケージ化されていない拡張機能を読み込む」→ side-clock/ を選択
# コード変更後は拡張機能カードの 🔄 ボタンでリロード
```
