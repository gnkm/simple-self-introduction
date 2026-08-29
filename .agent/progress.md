# 進捗

セッション間の引き継ぎ。**次のセッションは記憶ゼロで始まる。**
停止する前に必ず更新すること。

最終更新: 2026-08-29

## いま動いているもの

- 仕様: `docs/srs.md`（A4 1 枚制約は撤廃。印刷は A4 縦、2 枚以上可。セクション区切り必須。frontmatter の github / blog / x は氏名直下のリンクで、テキストと href が同じ URL）
- 完了判定: `.agent/feature_list.json`（F001–F013 `passes: true`。F006 / F010 のヘッダ記述は旧仕様のまま。正は seed / SRS）
- `pnpm check`（`biome check .` と `tsc --noEmit`）
- `pnpm build`（型検査付き Vite 本番ビルド）
- `pnpm dev`（Vite。ポート 3210・`strictPort: true`・`host: "localhost"`。IPv4/IPv6 ループバック）
- GET `/` が `contents/self-introduction.md` を unified（`remark-parse` → `remark-frontmatter` → `remark-rehype` → `rehype-stringify`）で HTML にして返す。生 HTML は通さない。ブラウザで md を fetch しない。開発中は `/@vite/client` を注入し、ソース Markdown の保存で Vite `full-reload`
- ページ先頭ヘッダ: frontmatter の `name` を 1 つの `h1` に出し、存在する github / blog / x を氏名直下のリンクとして出す（内側と href は同じ URL）。本文の `{name}` は展開する。Markdown の見出し 1 はヘッダに統合
- 見出し 2 から次の見出し 2 直前までを `<section>` で包む。趣味 / 現在の業務内容 / スキル / 資格の文言はソースどおり。見出し名では分岐しない
- 箇条書きは 1 列の長い黒丸にしない。資格は `<table>`、スキルは親・子ともタグ（親は青灰 `#dce3ec`、子は既存タグ色。同じ親の子は直後のグループ）、「課金しています」直後は `.tags` 横並び。その他のフラットリストは `.list-stack` 縦箇条書き。その他の入れ子は親＋子タグ。リスト文言は省略しない
- ページ内の http(s) リンクは `target="_blank"` と `rel="noopener noreferrer"`。単独行 URL は自動リンク。空の href の a は残さない
- GET `/page.css` と `/list-layout.css` はプラグインが `text/css` で生 CSS を返す（`src` 直リンクだと Vite が JS モジュールにする）
- 画面デザイン: 紙色背景 `#f6f4ef`、本文 `#1c1b19`、アクセント `#2c4a6e` をカスタムプロパティ経由。ヘッダは氏名とその直下の URL リンク（アクセント色の小さいダイヤ形ビュレット、`align-items: center`）・下罫線。見出し 2 セクションは 1px 枠＋左 4px アクセント。趣味 h3 は 1 列。フッター無し
- 印刷: `@page { size: A4 portrait; margin: 12mm; }`、印刷時 11pt、`break-inside: avoid`。現行分量は 2 ページ
- GitHub Actions `.github/workflows/ci.yml`（`pull_request` と `main` への `push` で `pnpm check`）
- Cloud Agent `start`: `.cursor/sync-latest-main.sh` が `origin/main` を fetch し、クリーンな default branch なら fast-forward する
- 入力異常: ソース欠落・壊れた YAML・`name` 欠落は GET `/` が HTTP 500 と `入力エラー` ページ（パスと原因）。Untitled にしない。コンソールに `入力異常: <path>`

## いま動いていないもの

- feature_list の未完了項目は無い

## 次にやること

1. 業務リストと見出し 3 の重複は未着手。ユーザー指示があれば対応
2. feature_list（F001–F013）は完了。F006 / F010 のヘッダ記述は旧仕様のまま。正は seed / SRS

## 直近のセッションでやったこと

### 2026-08-29（遊びリストを縦箇条書きに）

- ユーザー指示: 生成 AI の遊び 3 件も通常の縦箇条書き
- SRS 3.1.3 の既定を 2 列グリッドから縦並びに変更。課金・スキル・資格の例外は維持
- `listToFlatGrid` と `.list-grid` を削除。残りフラットはすべて `.list-stack`
- 検証: `pnpm check` exit 0。`curl` で遊び 3 件が `ul.list-stack`。課金は `.tags`。`list-grid` なし

### 2026-08-29（今後挑戦したいことを縦箇条書きに）

- ユーザー指示: 「生成 AI の導入支援 / 生成 AI を用いた開発」も通常の縦箇条書き
- SRS 3.1.3 を「直後が見出し 3、またはセクション末尾」に広げてから実装。見出し名では分岐しない
- 検証: `pnpm check` exit 0。`curl` で今後挑戦が `ul.list-stack`。業務も list-stack。遊び 3 件は list-grid のまま

### 2026-08-29（業務担当リストを縦箇条書きに）

- ユーザー指示: 現在の業務内容の「Yocto レシピ作成 / ウェブアプリ開発」は 2 列ではなく通常の縦箇条書き
- SRS 3.1.3 に「直後が見出し 3 のフラットなリストは縦並び」を追加してから実装
- `densifyLists` が次要素が `h3` なら `.list-stack`。見出し名では分岐しない
- 検証: `pnpm check` exit 0。`curl` で当該リストが `ul.list-stack` の 2 `li`。遊びリストと今後挑戦は従来どおり `list-grid`

### 2026-08-29（スキルをすべてタグに）

- ユーザー指示: スキルの親がテキスト・子がタグだったのを、すべてタグにし、子は色を変えて階層が分かるようにする
- SRS 3.1.3 と 6.3 を先に更新してから実装。コードで仕様を上書きしない
- `listToSkillGroups` が親・子とも `ul.tags` の `li`。親は `.skill-parent`、子は `.skill-child`。同じ親の子は同じ `.skill-group` に並べる
- 親タグは `#dce3ec`＋アクセント文字、子は `#ece8e0`。`.tags > li` より強いセレクタにしないと親色が負ける
- 検証: `pnpm check` exit 0。`curl` で親 9・子 5（Python 配下 LightGBM 等、TypeScript 配下 React / Astro）。Chrome ヘッドレスで親が青灰・子が暖色のタグであることを確認

### 2026-08-28（F013・入力異常の表示）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（`8b3bc1fd`）を確認してから着手。ブランチ `feat/input-error-display`
- 欠落は `readSourceMarkdown` がパス付き Error。壊れた YAML と `name` 欠落は `extractFrontmatter` が投げる。プラグインが 500 と `renderErrorPage`（title は `入力エラー`）
- 検証: `pnpm check` exit 0。ファイル退避 → curl 500・`ソース Markdown がありません`。復元 → 200。`name:` 削除 → 500・`frontmatter の name がありません`。確認後ソース復元。壊れた YAML も 500。verifier PASS のため F013 の `passes` を true にした
- 既存の 3210 プロセスを止めてブランチの `pnpm dev` を起動した

### 2026-08-28（F012・ソース Markdown の追従）

- ユーザー指示: `pnpm dev` でホットリロードできるようにする
- GET `/` がプラグイン HTML のため Vite client が無かった。`/@vite/client` を注入し、`contents/self-introduction.md` の change/add で `full-reload`
- 検証: `pnpm check` exit 0。プローブ `FEATURE_LIST_HMR_PROBE` を末尾追加 → curl が `<p>` でヒット。HMR WS が `{"type":"full-reload"}`。確認後ソース復元。verifier PASS のため F012 の `passes` を true にした
- 既存の 3210 プロセスを止めてブランチの `pnpm dev` を起動した

### 2026-08-28（ヘッダ URL リストにダイヤ形ビュレット）

- ユーザー指示: github / blog / x のリストにビュレットが無い。かっちょいいビュレットを足す。続いて縦位置が文字とずれている
- `.profile-urls > li` は `align-items: center`。`::before` は `clip-path` のダイヤ（回転のレイアウトずれを避ける）
- 検証: ヘッドレス 2x 画面でダイヤのインク範囲と URL 字形の上下が一致

### 2026-08-28（ヘッダ URL をリンクテキストに）

- ユーザー指示: リンクは可。問題は URL が見えないこと。`a` の内側と href を同じ URL にする
- seed / SRS を更新。GitHub / Blog / X ラベルは使わない。氏名直下は維持
- `renderHeaderUrls` が `<a href="{url}">{url}</a>`。`target="_blank"` と `rel="noopener noreferrer"`
- 検証: `pnpm check` exit 0。`curl` で 3 URL すべて text==href。ラベル無し

### 2026-08-28（ヘッダ URL を文字列表示）

- ユーザー指示: PDF 配布でリンク情報が落ちるため、github / blog / x はリンクにせず氏名の直下に URL 文字列として出す
- seed / SRS を先に更新（コードで仕様を上書きしない）。`feature_list.json` の記述はルールどおり未変更
- `renderHeaderUrls` が `ul.profile-urls` に URL を `li` で出す。ヘッダに `a` は無い。本文の dotfiles は従来どおり外部リンク
- 検証: `pnpm check` exit 0。`curl` で h1 直下に 3 URL・ヘッダ内 `a` なし。Chrome ヘッドレス画面で氏名直下に URL 文字列を確認

### 2026-08-28（F011・A4 複数ページと読みやすさ）

- ユーザー指示で A4 1 枚制約を撤廃。seed / SRS / F011 / README / PR テンプレを更新
- セクションを枠と左アクセントで区切る。趣味の h3 は 1 列。`@page` A4 縦・余白 12mm・印刷 11pt
- 検証: `pnpm check` exit 0。配信 CSS に `size: A4 portrait` / `margin: 12mm` / `break-inside: avoid` / `11pt`。ヘッドレス PDF は A4 2 ページ、資格最終行あり。Chrome 印刷プレビューも 2 pages・ヘッダーフッター off。verifier PASS のため F011 の `passes` を true にした
- GUI 用 `google-chrome` ラッパーを長いシェルから起動すると spawn が Abort する。ヘッドレスは `/usr/bin/google-chrome-stable` と別 user-data-dir を使う

### 2026-08-27（F010）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（F009 マージ済み `7c9a755`）を確認してから着手
- `src/styles/page.css` に 6.3 トークンとヘッダ（左氏名・右リンク・下罫線）、A4 相当幅の中央寄せ。`/page.css` はプラグインが `text/css` で返す
- `wrapHeading3Blocks` が見出し 3 ブロックを `.h3-grid` にし、自動で 1〜2 列。見出し名では分岐しない
- フッター要素・progress・巨大ヒーロー・ガラスモーフィズムは置かない。末尾は資格セクション
- 検証: `pnpm check` exit 0。配信 CSS に `--color-bg: #f6f4ef` / `--color-text: #1c1b19` / `--color-accent: #2c4a6e`。HTML に progress / footer / icon クラスなし。ブラウザでヒーロー無し・趣味 2 列・紙色背景を確認。verifier PASS のため F010 の `passes` を true にした

### 2026-08-27（F009）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（F008 マージ済み `ab00028`）を確認してから着手
- ヘッダと本文の http(s) `a` に `target="_blank"` と `rel="noopener noreferrer"` を付ける。単独行 URL は mdast で link 化する。空 href は unwrap
- 検証: `pnpm check` exit 0。GET `/` の 4 本の http(s) リンク（GitHub / Blog / X / dotfiles）がすべて属性付き。空 href なし。verifier PASS のため F009 の `passes` を true にした

### 2026-08-27（F008）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（F007 マージ済み `0f6e219`）を確認してから着手
- `densifyLists` が hast のリストを変換する。資格→表、スキル→グループ＋タグ、課金段落直後→折り返しタグ、その他の入れ子→親＋子タグ
- 入れ子を全幅 table にすると子タグが右端へ離れるため、グループ＋タグにした
- `/list-layout.css` をプラグインが `text/css` で返す。`/src/styles/...` 直リンクは Vite が JS にする
- 検証: `pnpm check` exit 0。`curl` で課金 7 件、資格 `<table>` 4 行、スキル `.skill-groups`。ページは単一 ul ではない。ブラウザでタグ横並びと 2 列スキルを確認。verifier は CSS 配信修正後に PASS。F008 の `passes` を true にした

### 2026-08-27（F007）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（F006 マージ済み `26a3e88`）を確認してから着手
- `wrapHeading2Sections` が hast の `h2` から次の `h2` 直前までを `<section>` にする。日本語見出し名では分岐しない
- 検証: `pnpm check` exit 0。`curl` で指定文言がすべてヒット。4 つの `section>h2`（趣味 / 現在の業務内容 / スキル / 資格）。見出しは header の h1 → section の h2 → h3。ブラウザでも欠落なしを確認。verifier PASS のため F007 の `passes` を true にした

### 2026-08-27（F006）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（F005 マージ済み `baed551`）を確認してから着手
- `yaml` で frontmatter を解析し、`{name}` を AST 上で置換。見出し 1 と yaml ノードは本文から除き、氏名はヘッダの `h1` に統合
- 存在する `github` / `blog` / `x` だけを GitHub / Blog / X のテキストラベルリンクにする
- 検証: `pnpm check` exit 0。`curl` で `h1` が 1 つ・中身 `gnkm`・生 `{name}` なし・3 URL とテキストラベル。ブラウザで二重タイトル無しとリンク先を確認。verifier PASS のため F006 の `passes` を true にした

### 2026-08-27（F005）

- 開始時に `.cursor/sync-latest-main.sh` で `origin/main`（F004 マージ済み `e1fa6de`）を確認してから着手
- `unified` + `remark-parse` + `remark-frontmatter` で mdast にし、`remark-rehype`（`allowDangerousHtml: false`）+ `rehype-stringify` で HTML にする
- GET `/` はエスケープ済み `<pre>` ではなく見出し・段落・リストの HTML を返す。frontmatter は AST の `yaml` ノードになり本文に出ない
- 検証: `pnpm check` exit 0。`from "unified"` と `remark-parse` の import あり。見出し文言の TS 複製なし。`curl` が 200 / `text/html; charset=utf-8` で `サイクリング` と `応用情報技術者` を含む。`<script>` 一時追加は実行タグにならない（確認後ソースを復元）。verifier PASS のため F005 の `passes` を true にした

### 2026-08-26（F004）

- このセッション開始時の作業ツリーは F001 まで。`git fetch origin main` で F002・F003 マージ済み（`5a4a752`）を取り込み、F004 に着手
- `src/vite-plugin-self-intro.ts` が GET `/` と `/index.html` を横取りし、`contents/self-introduction.md` を読んで完成 HTML を返す
- 変換は F005 の範囲外のため unified は使わず、HTML エスケープして `<pre>` に載せる
- Vite プラグイン用に `@types/node@22` を追加
- 検証: `pnpm check` exit 0。`curl -sS -D - http://localhost:3210/` が 200 かつ `Content-Type: text/html; charset=utf-8`。本文が `<!doctype html` で始まり、`サイクリング` と `応用情報技術者` がヒット。レスポンスと `index.html` に md への fetch/XHR なし。verifier 合格のため F004 の `passes` を true にした

### 2026-08-26（ハーネス: Cloud 起動時の最新取得）

- プレビルド Build は `gitSetup: reuse` のため、作業ツリーの `main` が remote より古い
- このセッション開始時も `main` が origin より 3 コミット遅れており、未 fetch だと完了済み F002 に再着手するところだった
- `.cursor/sync-latest-main.sh` を追加し、`environment.json` の `start` から実行
- `AGENTS.md` / implement-next-feature / `agent-loop.mdc` で、対象選定前の fetch を必須にした
- feature ブランチ・dirty・分岐した local `main` は checkout しない。クリーンな ancestor だけ `git merge --ff-only`
- 検証: 古い main（F002 false）→ origin/main（F002 true）、feature / dirty / diverged は維持、detached は FF、`pnpm check` exit 0。verifier 合格

### 2026-08-26（F003）

- `vite.config.ts`: `server.port: 3210`、`strictPort: true`、`host: "localhost"`
- IPv4 / IPv6 ループバックの両方だけ待つプラグイン（`host: true` は LAN 公開になるため使わない）
- 検証: `pnpm install && pnpm dev` のログに `http://localhost:3210/`。`curl` が `200 http://localhost:3210/`。`127.0.0.1:3210` も 200。使用中ポートではフォールバックせず失敗
- verifier 合格のため F003 の `passes` を true にした

### 2026-08-26（F002）

- GitHub Actions: `.github/workflows/ci.yml`
- トリガ: `pull_request` 全体、`push` は `main` のみ
- `pnpm/action-setup@v4` + `actions/setup-node@v4`（Node 22、`cache: pnpm`）
- `pnpm install --frozen-lockfile` のあと `pnpm check`
- `package.json` に `packageManager: pnpm@10.33.3` と Vite 8 と同じ `engines.node`（`^20.19.0 || >=22.12.0`）
- 検証: ワークフロー存在、必須文字列、Node / packageManager 矛盾なし、`pnpm check` exit 0
- verifier 合格のため F002 の `passes` を true にした

### 2026-08-26（F001）

- F001 開発環境の基盤: Vite 8.2.2、TypeScript 5.9.3（strict）、scripts `dev` / `build` / `check`
- 入口はプレースホルダの `index.html` と `src/main.ts`（`export {}`）。完成 HTML は未実装
- 検証: `test -f tsconfig.json && test -f vite.config.ts`、strict、3210、scripts、`pnpm check` exit 0、src に `: any` / `as any` なし。追加で `pnpm build` exit 0
- verifier 合格のため F001 の `passes` を true にした

## ハマった点・想定と違ったこと

- TypeScript の npm 最新は 7.0.2 だが、Vite 8 テンプレ相当の 5.9.3 を採用した（`pnpm check` / `build` は通る）
- CI の `node-version: 22` は latest 22.x。Vite は `>=22.12.0`。現行の GitHub エイリアスでは矛盾しない
- この環境の `localhost` は IPv6 (`::1`) が先。`host` 未指定だと `127.0.0.1:3210` に繋がらない
- Cloud Agent は Environment Build の recorded commit を再利用する。公式の always-pull は Builds タブの Staleness threshold `0`。リポジトリ側でも `start` で fetch する
- プレビルドの作業ツリーが古いと F003 完了済みでも `feature_list.json` が F001 止まりに見える。対象選定前に `origin/main` を取り込む
- Vite 8 は `vite.config.ts` から拡張子なしで `src/*.ts` を import すると native configLoader 警告が出る。`.ts` を付ける
- プレビルドの `pnpm dev`（PID 2580）が 3210 を占有していた。F005 確認前にその PID を止めてブランチのサーバを起動した
- `import type { Root } from "mdast"` は直接依存が無く `tsc` が落ちる。戻り値型は推論に任せた
- `page.css` を `list-layout.css` より先に読むと、A4 未満 1 列の media がスキル 2 列指定に負ける。畳みは `list-layout.css` 側に置く
- GUI 用 `/usr/local/bin/google-chrome` は `--remote-debugging-port=9222` と共有プロファイル付き。長いシェルから起動すると `Command failed to spawn: Aborted`。ヘッドレス PDF は `/usr/bin/google-chrome-stable --headless=new` と別 `--user-data-dir` を使う
- F013 検証で Chrome ヘッドレスが GoogleUpdater でハングした。スクリーンショット後もプロセスが残る。ソース退避中なら先に Markdown を戻してから Chrome を殺す
