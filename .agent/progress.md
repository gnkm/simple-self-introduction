# 進捗

セッション間の引き継ぎ。**次のセッションは記憶ゼロで始まる。**
停止する前に必ず更新すること。

最終更新: 2026-08-27

## いま動いているもの

アプリは未実装。`pnpm dev` はまだ存在しない。

- 仕様: `docs/srs.md`
- 完了判定: `.agent/feature_list.json`（F001–F013、すべて `passes: false`）
- エージェント入口: `AGENTS.md`

## いま動いていないもの

- 開発サーバ、ページ、印刷 CSS、unified パイプライン

## 次にやること

1. **F001 開発環境の基盤構築** — 依存なし。Vite / TypeScript / `pnpm check` を先に通す。次は F002 CI、そのあと F003 開発サーバ。

## 直近のセッションでやったこと

### 2026-08-27

- `docs/srs.md` と `.agent/feature_list.json` を書いた
- コーディングエージェント用ハーネス（`AGENTS.md`、ルール、実装スキル、本ファイルの初期化）を置いた
- feature_list を組み替え、F001 基盤 → F002 CI → F003 サーバ以降にした（旧 Lint 単独項目は F001 に統合）
- 検証: 未実装のため feature の verification は未実行。全 `passes` は false のまま

## ハマった点・想定と違ったこと

- なし
