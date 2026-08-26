# 進捗

セッション間の引き継ぎ。**次のセッションは記憶ゼロで始まる。**
停止する前に必ず更新すること。

最終更新: 2026-08-26

## いま動いているもの

- 仕様: `docs/srs.md`
- 完了判定: `.agent/feature_list.json`（F001–F004 `passes: true`。F005–F013 は false）
- `pnpm check`（`biome check .` と `tsc --noEmit`）
- `pnpm build`（型検査付き Vite 本番ビルド）
- `pnpm dev`（Vite。ポート 3210・`strictPort: true`・`host: "localhost"`。IPv4/IPv6 ループバック）
- GET `/` が `contents/self-introduction.md` を HTML エスケープして `<pre>` に埋め込んだ完成 HTML を返す（ブラウザで md を fetch しない）
- GitHub Actions `.github/workflows/ci.yml`（`pull_request` と `main` への `push` で `pnpm check`）
- Cloud Agent `start`: `.cursor/sync-latest-main.sh` が `origin/main` を fetch し、クリーンな default branch なら fast-forward する

## いま動いていないもの

- unified による Markdown 変換（F005）
- ヘッダ・氏名・`{name}` 展開（F006）
- セクション構成・箇条書きレイアウト・印刷 CSS

## 次にやること

1. **F005 unified による Markdown 変換** — 依存 F004 完了。`unified` + `remark-parse` を中核にし、正規表現だけで HTML にしない。
2. そのあと **F006 ヘッダ・氏名・プレースホルダ**。

## 直近のセッションでやったこと

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
- 入口はプレースホルダの `index.html` と `src/main.ts`（`export {}`）。完成ページは未実装
- 検証: `test -f tsconfig.json && test -f vite.config.ts`、strict、3210、scripts、`pnpm check` exit 0、src に `: any` / `as any` なし。追加で `pnpm build` exit 0
- verifier 合格のため F001 の `passes` を true にした

## ハマった点・想定と違ったこと

- TypeScript の npm 最新は 7.0.2 だが、Vite 8 テンプレ相当の 5.9.3 を採用した（`pnpm check` / `build` は通る）
- CI の `node-version: 22` は latest 22.x。Vite は `>=22.12.0`。現行の GitHub エイリアスでは矛盾しない
- この環境の `localhost` は IPv6 (`::1`) が先。`host` 未指定だと `127.0.0.1:3210` に繋がらない
- Cloud Agent は Environment Build の recorded commit を再利用する。公式の always-pull は Builds タブの Staleness threshold `0`。リポジトリ側でも `start` で fetch する
- プレビルドの作業ツリーが古いと F003 完了済みでも `feature_list.json` が F001 止まりに見える。対象選定前に `origin/main` を取り込む
- Vite 8 は `vite.config.ts` から拡張子なしで `src/*.ts` を import すると native configLoader 警告が出る。`.ts` を付ける
