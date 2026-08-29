# 進捗

セッション間の引き継ぎ。**次のセッションは記憶ゼロで始まる。**
停止する前に必ず更新すること。

最終更新: 2026-08-29

## いま動いているもの

- 仕様: `docs/srs.md`（機能）。見た目の再現は `docs/design-system.md`。想定読者は同じ派遣会社の別案件の同僚。PDF が最終形。セクション区切りは余白が主。枠・左右縦線は置かない
- 完了判定: `.agent/feature_list.json`（F001–F013 `passes: true`。F006 / F010 のヘッダ記述は旧仕様のまま。正は seed / SRS）
- `pnpm check`（`biome check .` と `tsc --noEmit`）
- `pnpm build`（型検査付き Vite 本番ビルド。完成 HTML と CSS を `dist/` に出す。プレースホルダ JS は残さない。入力異常は非 0）
- `pnpm preview`（`dist/` の静的確認）
- `pnpm pages:deploy`（build のあと Wrangler で Cloudflare Pages に上げる。要 `wrangler login`）
- `pnpm dev`（Vite。ポート 3210・`strictPort: true`・`host: "localhost"`。IPv4/IPv6 ループバック）
- GET `/` が `contents/self-introduction.md` を unified（`remark-parse` → `remark-frontmatter` → `remark-rehype` → `rehype-stringify`）で HTML にして返す。生 HTML は通さない。ブラウザで md を fetch しない。開発中は `/@vite/client` を注入し、ソース Markdown の保存で Vite `full-reload`
- ページ先頭ヘッダ: `name` を 1 つの `h1`。任意の `summary`（導入）と `updated`（YYYY 年 M 月時点）。github / blog / x はラベル＋ URL を横並び。本文の `{name}` は展開。Markdown の見出し 1 はヘッダに統合
- 見出し 2 から次の見出し 2 直前までを `<section>` で包む。現行ソース順は業務 → スキル → 資格 → 今後挑戦 → 趣味。見出し名では分岐しない
- 箇条書きは 1 列の長い黒丸にしない。資格は 2 列表（名称 / 取得、末尾括弧を列分け）。スキルはカテゴリラベル＋子タグ行。見出し 4「課金中のサービス」直下は `.tags`。その他フラットは `.list-stack`。リスト文言は省略しない
- ページ内の http(s) リンクは `target="_blank"` と `rel="noopener noreferrer"`。単独行 URL は自動リンクし表示からスキームを省く。空の href の a は残さない
- GET `/page.css` と `/list-layout.css` はプラグインが `text/css` で生 CSS を返す（`src` 直リンクだと Vite が JS モジュールにする）
- 画面デザイン: 紙色 `#f6f4ef`。ヘッダ全幅下罫線。h2 は 1.35em・短い下線。h3 は 1.14em、行頭に補助色の右向き三角。h4 は 1em・補助色。スキルはラベル列＋タグ。資格は薄い行罫線。画面フッター無し。印刷時のみ `.print-id`（氏名・時点）
- 印刷: `@page { size: A4 portrait; margin: 12mm; }`、背景白、11pt、タグは枠線＋白。`break-inside: avoid` は h2/h3/h4 塊・スキル行・表行。現行 PDF は 2 ページ。テキスト選択可
- GitHub Actions `.github/workflows/ci.yml`（`pull_request` と `main` への `push` で `pnpm check` と `pnpm build`）
- Cloudflare: `wrangler.jsonc` の `assets.directory` が `./dist`。Git 連携はビルド後に `npx wrangler deploy`。CLI は `pnpm pages:deploy`
- Cloud Agent `start`: `.cursor/sync-latest-main.sh` が `origin/main` を fetch し、クリーンな default branch なら fast-forward する
- 入力異常: ソース欠落・壊れた YAML・`name` 欠落は GET `/` が HTTP 500 と `入力エラー` ページ（パスと原因）。Untitled にしない。コンソールに `入力異常: <path>`

## いま動いていないもの

- feature_list の未完了項目は無い

## 次にやること

1. Cloudflare Pages に載せるには Cloudflare アカウントで Git 連携するか `pnpm wrangler login` のあと `pnpm pages:deploy`
2. feature_list（F001–F013）は完了。F006 / F010 のヘッダ記述は旧仕様のまま。正は seed / SRS

## 直近のセッションでやったこと

### 2026-08-29（wrangler deploy の Missing entry-point）

- Git 連携は `pnpm build` のあと `npx wrangler deploy` を走らせる。`pages_build_output_dir` だと Pages 扱いのまま Worker 入口が無く落ちる
- `wrangler.jsonc` を `assets.directory: ./dist` に変更。`pages:deploy` も `wrangler deploy` に揃えた

### 2026-08-29（Pages の root directory not found）

- Git 連携がクローン直後に失敗。`dist` は gitignore なので **Root directory** に書くと存在しない。空（リポジトリルート）にし、`dist` は Build output だけ。README に注意を足した

### 2026-08-29（README の Cloudflare 手順）

- ユーザー指示: Cloudflare へのデプロイ手順を README に書く
- 既存の短い節を、手元の `build` / `preview`、Git 連携の入力表、CLI、Git と Direct Upload は切り替え不可、まで具体化した

### 2026-08-29（Cloudflare Pages）

- ユーザー指示: Cloudflare Pages にデプロイできるようにする。seed / SRS を先に更新（本番デプロイ非ゴールを外し、CF Pages と静的 `dist` を範囲に入れた）
- `selfIntroPlugin` の `closeBundle` が完成 HTML と CSS を `dist/` に書き、プレースホルダの `assets/` を消す。入力異常はビルド失敗
- `wrangler.jsonc`、`pnpm preview`、`pnpm pages:deploy`、README の Git 連携と CLI。CI に `pnpm build` を追加
- 検証: `pnpm check` / `pnpm build` exit 0。`dist/index.html` が gnkm と本文。`page.css` / `list-layout.css` あり、`assets/` なし。`pnpm preview` で `/` と `/page.css` が 200。Chrome ヘッドレスで完成ページを確認。verifier PASS。実際の Cloudflare への upload は API トークンが無く未実施

### 2026-08-29（見出し 3 の行頭に短い印）

- ユーザー提案: 行頭の印で小見出しと分かるようにする。横線は壊れた箇条書きに見えるので却下。右向き三角でセクションの内訳を示す
- 文字の ▶ は絵文字化するため、`clip-path` の三角形（補助色、高さ 0.58em）。ダイヤは URL と衝突するため使わない
- SRS 6.2 / design-system / `h3::before`

### 2026-08-29（想定読者を同僚に）

- ユーザー指示: 派遣会社所属、他社案件。別案件の社員への自己紹介
- seed / SRS 1.1・2.2・6.1 / design-system 1・2・3 を更新。採用・職務経歴の前提を外す。並びは「今の担当が先」のまま

### 2026-08-29（デザインシステム文書）

- ユーザー指示: 修正提案を含め、再現できるデザインシステムのドキュメント
- `docs/design-system.md` を追加（原則、線の言語、トークン、スケール、余白、部品、印刷、チェックリスト）。数値は現行 CSS に合わせた
- seed / SRS 6 / AGENTS 正本 / ARCHITECTURE / README / implement-next-feature から参照

### 2026-08-29（課金リストを見出し 4 で分岐）

- ユーザー指示: 段落の「課金しています」は不安定。課金は「生成 AI と戯れる」の内側なので見出し 4「課金中のサービス」にする
- seed に見出し 2→3→4 の階層を追加。SRS 3.1.2 / 3.1.3 / 6.2 / 印刷・検証を先に更新してから実装
- ソースの段落を `#### 課金中のサービス` に置換。`densifyLists` は直前が h4「課金中のサービス」のとき `.tags`。`wrapHeading3Blocks` は h4 を h3 ブロック内に残す
- h4 は 1em・補助色。見出し 3 ブロック間より狭い余白にして、兄弟の h3 に見えないようにした
- 検証: `pnpm check` exit 0。`curl` で h4 が「生成 AI と戯れる」の `.h3-block` 内、直後は `ul.tags` 7 件。遊び 3 件は `list-stack`。Chrome ヘッドレスで趣味欄を確認

### 2026-08-29（PDF 配布向けの改善提案を取捨選択）

- 採用: セクション順（業務が先、趣味が後）、サマリ、見出し階層と余白比、スキル分類、改ページ制御、ラベル＋ URL 横並び、業務の重複削除、資格 2 列、和文改行スペース除去、印刷白背景、時点表示
- 見送り: QR、余白 20mm（12mm 維持。1 ページ目の情報量を優先）、Vivliostyle、Chrome 非対応のページ番号、チップの常用/趣味の枠線差
- ソース Markdown を更新（順・サマリ・スキル行・資格表記）。`summary` / `updated` を frontmatter に追加
- 検証: biome / tsc exit 0。HTML で h2 順・スキル 5 ラベル・資格 2 列・Yocto 見出しは 1 回。Chrome PDF 2 ページ、フォント埋め込みあり（テキスト選択可）

### 2026-08-29（セクション枠をやめ余白で区切る）

- ユーザー指示: 線は効果的なものだけ。特にセクション左右の縦線をなくし、余白を主にする
- seed / SRS を先に更新（枠・左アクセント縦線を禁止。区切りは余白＋見出し幅の短い下罫線）
- `section` の 1px 枠と左 4px を削除。h3 ブロック間の上罫線も削除。ヘッダ全幅罫線・資格表の行罫線・タグ枠は残す
- h2 は `width: fit-content` と `border-bottom: currentColor`（罫線色だと短い見出しが消える）
- 検証: `biome check` と `tsc --noEmit` exit 0。配信 CSS に `border-left` なし。Chrome ヘッドレス 900px で縦方向の連続バー 0。ヘッダ下は全幅グレー、趣味 h2 下は見出し幅のアクセント線

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
