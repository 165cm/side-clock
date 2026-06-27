# Chrome Web Store 公開用ドキュメントたたき台

最終確認日: 2026-06-27

この文書は Chrome Web Store Developer Dashboard へ入力する内容のたたき台です。公開前に、実際の Dashboard 表示とプライバシーポリシー URL を確認してください。

## 参照した公式情報

- Store listing: https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- Privacy practices: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Program Policies: https://developer.chrome.com/docs/webstore/program-policies/policies
- 現在の公開ページ: https://chromewebstore.google.com/detail/side-clock/ngdlibgjnildphejkapjccmonmglmkkg?authuser=0&hl=ja

## 現状分析と改善方針

### 現在の公開情報から見えたこと

- 公開中の短い説明は「フルスクリーン中に時計と天気をニュース番組風に表示」。
- 公開中の詳細説明は、機能一覧中心で「現在地の天気」という表現が残っている。
- 公開中の manifest は `version: 1.0.0` で、`geolocation` 権限が表示されている。
- 公開ページ上で確認できるスクリーンショットは1枚に見える。手元には5枚あるため、次回更新時に全投入する。
- 添付指標では、過去30日間のインストールは38件、地域は米国100%、言語は英語(US)100%、OS は ChromeOS 79% / Windows 21%。

### 改善方針

- 英語ユーザーが中心なので、英語掲載文を主戦場にする。
- 冒頭で「fullscreen clock」「weather overlay」「ChromeOS」「YouTube / streaming」「focus」を自然に入れる。
- 機能羅列だけでなく、「フルスクリーンを解除せずに時間を確認できる」という便益を先に出す。
- ChromeOS ユーザー向けに「desk setup」「study」「remote work」「digital signage / wall display」に近い利用シーンを入れる。
- 公開中の「現在地」「geolocation」印象はインストール前の不安になりやすいので、次回公開では「郵便番号登録」「no device geolocation」を明記する。
- スクリーンショットは1枚目で「実際に何が画面へ出るか」、2枚目で「fullscreen use case」、3枚目で「customization」を伝える順にする。

## 基本情報

| 項目 | 入力案 |
|---|---|
| 拡張機能名 | Side Clock |
| 公開中バージョン | 1.0.0 |
| 次回更新バージョン | 1.3.0 |
| 主言語の推奨 | English |
| 追加言語 | 日本語 |
| カテゴリ案 | Functionality / Productivity |
| 成熟したコンテンツ | なし |
| 公式URL案 | https://165cm.github.io/portfolio/apps/side-clock |
| プライバシーポリシー | https://majestic-gateway-e4a.notion.site/Privacy-Policy-36ee8c4088938052b9b2c7c77b5799cc |

## 推奨ストア名・短い説明

### Store name

Side Clock

短期では既存名を維持します。変更する場合の候補は `Side Clock - Fullscreen Clock` ですが、既存 URL とブランドの一貫性を優先するなら名前は触らない方針です。

### English short description

Fullscreen clock and weather overlay for videos, focus, and ChromeOS

### 日本語の短い説明

全画面動画に時計と天気を重ねて表示する集中用オーバーレイ

## ストア掲載文: 日本語

### 短い説明

全画面動画に時計と天気を重ねて表示する集中用オーバーレイ

### 詳細説明

Side Clock は、YouTube や Netflix などのフルスクリーン再生中に、現在時刻・日付・天気・60秒プログレスリングを画面の隅へ重ねて表示する Chrome 拡張機能です。

動画、オンライン授業、作業用モニター、ChromeOS の常時表示画面などで、フルスクリーンを解除せずに時間を確認できます。普段は邪魔にならないよう、初期設定ではフルスクリーン時のみ表示されます。

主な機能:

- フルスクリーン時のみ表示 / 常時表示の切り替え
- 時計、日付、60秒プログレスリングのオーバーレイ表示
- 郵便番号で登録した地点の天気表示
- パネル幅とアクセントカラーのカスタマイズ
- ドラッグ移動と4隅スナップ
- サイトごとの表示 / 非表示切り替え
- 24時間表示 / AM・PM 表示の切り替え
- 日本語・英語表示

天気機能は任意です。ユーザーが設定画面で国・地域と郵便番号を登録した場合のみ、緯度・経度に変換して Open-Meteo から現在の天気を取得します。端末の現在位置は使用しません。

こんな時に便利です:

- フルスクリーン動画を見ながら現在時刻を確認したい
- リモート作業やオンライン学習中に時計を常に見える位置へ置きたい
- 別タブを開かずに、登録地点の天気を軽く確認したい
- 動画視聴中に時間を忘れすぎないようにしたい
- Chromebook や据え置きディスプレイを小さな情報表示として使いたい

Side Clock は、必要な情報だけを画面の隅に小さく表示するシンプルな時計オーバーレイです。

## Store listing: English Draft

### Short description

Fullscreen clock and weather overlay for videos, focus, and ChromeOS

### Detailed description

Side Clock adds a clean clock and optional weather overlay to fullscreen videos, ChromeOS desk setups, study screens, and focused browser work.

Use it when you want to check the time without leaving fullscreen mode, switching tabs, grabbing your phone, or interrupting what is on screen. By default, Side Clock only appears in fullscreen mode, so it stays out of the way during normal browsing.

Key features:

- Fullscreen clock overlay for YouTube, streaming, study, and focus sessions
- Optional weather for a saved postal-code location
- 60-second progress ring for quick visual time awareness
- Fullscreen-only mode or always-visible mode
- Drag positioning and corner snapping
- Custom panel width and accent color
- Per-site show / hide controls
- 24-hour or AM/PM clock format
- English and Japanese localization

Weather is optional. When enabled, Side Clock uses the country or region and postal code entered by the user to resolve approximate coordinates, then fetches current weather from Open-Meteo. It does not use device geolocation.

Use Side Clock when you want to:

- Check the time while watching fullscreen video
- Keep a quiet clock visible on a Chromebook, second monitor, or wall display
- Stay focused during remote work or online study
- See simple weather information without opening another tab
- Stay aware of elapsed time while staying focused

Side Clock is designed to be lightweight, readable, and easy to move out of your way.

## A/B テスト用の英語冒頭案

### A: ChromeOS / fullscreen 特化

Side Clock adds a clean clock and optional weather overlay to fullscreen videos, ChromeOS desk setups, study screens, and focused browser work.

### B: 動画視聴特化

Keep the time visible while watching YouTube, Netflix, lectures, or any fullscreen video. Side Clock adds a small clock and weather overlay without making you leave fullscreen mode.

### C: 作業・集中特化

Turn any browser tab, Chromebook, or second monitor into a quiet time display. Side Clock keeps the current time and optional weather visible while you stay focused.

## 単一目的の説明

Side Clock の単一目的は、ブラウザ上の動画視聴や作業中に、時刻と任意の天気情報を小さなオーバーレイとして表示し、ユーザーがページ遷移せずに時間を確認できるようにすることです。

## 権限の説明

| 権限 | 申請画面向け説明 |
|---|---|
| `storage` | 時計表示設定、パネル位置、色、表示モード、サイトごとの非表示設定、天気表示用にユーザーが登録した国・地域 / 郵便番号 / 解決済み座標を保存するために使用します。 |
| `activeTab` | ポップアップを開いた時に現在のタブの URL ホスト名を確認し、そのサイトで Side Clock を表示するかどうかを切り替えるために使用します。ページ内容の読み取りや外部送信には使用しません。 |
| `https://api.open-meteo.com/*` | ユーザーが天気表示を有効にし、地点を登録した場合に、登録地点の現在天気を取得するために使用します。 |
| `https://api.zippopotam.us/*` | ユーザーが入力した国・地域と郵便番号を、天気取得に必要な緯度・経度へ変換するために使用します。 |
| `<all_urls>` content script | ユーザーが任意の Web ページやフルスクリーン動画上で時計オーバーレイを表示できるよう、ページ上へオーバーレイ UI を挿入するために使用します。ページ本文の収集や送信には使用しません。 |

## リモートコード

No, I am not using remote code.

補足: 外部 API から天気データと郵便番号検索結果を取得しますが、外部サーバーから JavaScript や実行可能コードを読み込んだり実行したりしません。

## データ利用・プライバシー

### 収集・保存するデータ

| データ | 保存先 | 用途 |
|---|---|---|
| 表示設定 | `chrome.storage.sync` | 表示モード、位置、幅、色、時刻形式などを保持するため |
| サイト別の非表示リスト | `chrome.storage.sync` | ユーザーが指定したサイトでオーバーレイを非表示にするため |
| 天気用の国・地域 / 郵便番号 | `chrome.storage.sync` | ユーザーが登録した地点を保持するため |
| 天気用の緯度・経度 / 地点名 | `chrome.storage.sync` | Open-Meteo から天気を取得するため |
| 天気キャッシュ | `chrome.storage.session` | 同一座標の天気取得を短時間で繰り返さないため |

### 外部送信するデータ

| 送信先 | 送信内容 | 目的 |
|---|---|---|
| Zippopotam.us | 国・地域コード、郵便番号 | 郵便番号から緯度・経度を取得するため |
| Open-Meteo | 緯度・経度 | 現在天気を取得するため |

### 収集しないデータ

- 端末の現在位置
- 閲覧履歴
- ページ本文
- ログイン情報
- 氏名、メールアドレス、金融情報、健康情報
- 広告目的のデータ

### データ利用の宣言案

Side Clock は、時計オーバーレイの表示設定と、任意の天気表示に必要な地点情報のみを保存します。保存した情報は、拡張機能の表示・設定同期・天気取得のためにのみ使用します。ユーザーの閲覧履歴やページ本文を収集、販売、広告利用することはありません。

## テスト手順案

1. Chrome で `chrome://extensions` を開き、デベロッパーモードを有効にする。
2. この拡張機能を読み込む。
3. 任意の動画ページを開き、ページまたはブラウザをフルスクリーン表示にする。
4. 画面右上に Side Clock の時計オーバーレイが表示されることを確認する。
5. 拡張機能アイコンをクリックし、表示モードを「常に表示」に切り替える。
6. 通常表示のページでもオーバーレイが表示されることを確認する。
7. パネル幅、アクセントカラー、24時間 / AM・PM 表示を変更し、表示が反映されることを確認する。
8. オーバーレイ上部のグリップをドラッグし、位置を移動できることを確認する。
9. 設定で天気を有効にし、日本の郵便番号を登録する。例: `100-0001`
10. 登録地点名が表示され、天気情報がオーバーレイに表示されることを確認する。
11. 現在のサイトで表示をオフにし、そのサイトでオーバーレイが非表示になることを確認する。

## 画像アセット

### 推奨スクリーンショット

すべて 1280x800 px。

| ファイル | 用途案 |
|---|---|
| `webstore/screenshots-pr-video/side-clock-video-01-talk-show.png` | 1枚目。動画視聴中に時刻を確認できることを最初に伝える |
| `webstore/screenshots-pr-video/side-clock-video-02-variety-challenge.png` | 2枚目。YouTube / 配信 / バラエティ動画でも邪魔になりにくいことを伝える |
| `webstore/screenshots-pr-video/side-clock-video-03-morning-kitchen.png` | 3枚目。朝の支度やながら見用途で時間管理できる便益を伝える |
| `webstore/screenshots-pr-video/side-clock-video-04-four-corners.png` | 4枚目。時計を4隅に配置できることをフラットな説明画像で伝える |
| `webstore/screenshots-pr-video/side-clock-video-05-morning-laptop.png` | 5枚目。朝のPC利用シーンで動画に時計を重ねる実用イメージを伝える |

`webstore/screenshots-pr-video/side-clock-video-contact-sheet.png` は確認用の一覧画像です。ストアには提出しません。

### 追加で必要な可能性がある画像

| アセット | 公式要件 | 状態 |
|---|---|---|
| Store icon | 128x128 px | `icons/icon128.png` あり |
| Screenshot | 1280x800 px、1〜5枚 | 5枚あり |
| Small promo tile | 440x280 px、PNG/JPEG | 未作成 |
| Marquee promo tile | 1400x560 px、PNG/JPEG、任意 | 未作成 |
| Promo video | YouTube URL、任意扱いにするか要確認 | 未作成 |

## 公開前チェックリスト

- [ ] `manifest.json` の `version` が公開版と一致している
- [ ] `manifest.json` の `description` と掲載文が矛盾していない
- [ ] プライバシーポリシーに、保存・送信するデータと Limited Use に関する説明が含まれている
- [ ] Dashboard の Privacy fields とプライバシーポリシーが矛盾していない
- [ ] Small promo tile を作成する
- [ ] 審査用パッケージに不要な生成物、秘密情報、`.env` が含まれていない
- [ ] フルスクリーン表示、常時表示、天気登録、サイト別非表示を手元で確認する
- [ ] サポート先 URL または連絡先を Dashboard に設定する
