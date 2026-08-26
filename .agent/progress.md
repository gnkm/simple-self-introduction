# 進捗

セッション間の引き継ぎ。**次のセッションは記憶ゼロで始まる。**
停止する前に必ず更新すること。

最終更新: 2026-08-26

## いま動いているもの

- 仕様: `docs/srs.md`
- 完了判定: `.agent/feature_list.json`（F001・F002 `passes: true`。F003–F013 は false）
- `pnpm check`（`biome check .` と `tsc --noEmit`）
- `pnpm build`（型検査付き Vite 本番ビルド。完成 HTML ではない）
- `vite.config.ts` で開発サーバポート 3210・`strictPort: true`
- GitHub Actions `.github/workflows/ci.yml`（`pull_request` と `main` への `push` で `pnpm check`）
- Cloud Agent `start`: `.cursor/sync-latest-main.sh` が `origin/main` を fetch し、クリーンな default branch なら fast-forward する

## いま動いていないもの

- 開発サーバの起動確認（F003）
- ソース Markdown を反映した完成 HTML（F004 以降）
- unified パイプライン、印刷 CSS

## 次にやること

1. **F003 開発サーバ起動** — 依存 F001 完了。`pnpm dev` が localhost:3210 をログに出し curl 200。
2. そのあと **F004 完成 HTML の返却**。

## 直近のセッションでやったこと

### 2026-08-26（ハーネス: Cloud 起動時の最新取得）

- プレビルド Build は `gitSetup: reuse` のため、作業ツリーの `main` が remote より古い
- このセッション開始時も `main` が origin より 3 コミット遅れており、未 fetch だと完了済み F002 に再着手するところだった
- `.cursor/sync-latest-main.sh` を追加し、`environment.json` の `start` から実行
- `AGENTS.md` / implement-next-feature / `agent-loop.mdc` で、対象選定前の fetch を必須にした
- feature ブランチや dirty な作業ツリーは checkout しない

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
- Cloud Agent は Environment Build の recorded commit を再利用する。公式の always-pull は Builds タブの Staleness threshold `0`。リポジトリ側でも `start` で fetch する
- F003 は別エージェントが PR #4 を開いている。次の機能実装はそれを確認してから
