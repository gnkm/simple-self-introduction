# 進捗

セッション間の引き継ぎ。**次のセッションは記憶ゼロで始まる。**
停止する前に必ず更新すること。

最終更新: 2026-08-27

## いま動いているもの

- 仕様: `docs/srs.md`
- 完了判定: `.agent/feature_list.json`（F001–F006 `passes: true`。F007–F013 は false）
- `pnpm check`（`biome check .` と `tsc --noEmit`）
- `pnpm build`（型検査付き Vite 本番ビルド）
- `pnpm dev`（Vite。ポート 3210・`strictPort: true`・`host: "localhost"`。IPv4/IPv6 ループバック）
- GET `/` が `contents/self-introduction.md` を unified（`remark-parse` → `remark-frontmatter` → `remark-rehype` → `rehype-stringify`）で HTML にして返す。生 HTML は通さない。ブラウザで md を fetch しない
- ページ先頭ヘッダ: frontmatter の `name` を 1 つの `h1` に出し、存在する URL を GitHub / Blog / X のテキストラベルでリンクする。本文の `{name}` は展開する。Markdown の見出し 1 はヘッダに統合
- GitHub Actions `.github/workflows/ci.yml`（`pull_request` と `main` への `push` で `pnpm check`）
- Cloud Agent `start`: `.cursor/sync-latest-main.sh` が `origin/main` を fetch し、クリーンな default branch なら fast-forward する

## いま動いていないもの

- セクション構成・箇条書きレイアウト・印刷 CSS
- 外部リンクの `target` / `rel`（F009）
- ソース追従と入力異常表示

## 次にやること

1. **F007 本文の欠落なしとセクション構成** — 依存 F006 完了。見出し 2 ごとにセクションを分け、ソースの情報を欠かさず出す。
2. 並行候補: **F009 外部リンク**（F006 依存）。ID 最小は F007。

## 直近のセッションでやったこと

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
