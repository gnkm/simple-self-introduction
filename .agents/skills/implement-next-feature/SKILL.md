---
name: implement-next-feature
description: Picks the next unfinished feature from feature_list.json, implements only that item, runs its verification, and hands off to the verifier before setting passes. Use when implementing the app, starting the next feature, working through the task list, or when the user says 次の機能・実装して・F001 など.
---

# 次の機能を実装する

## 手順

1. **対象を選ぶ前に** `.cursor/sync-latest-main.sh` を実行する（`git fetch origin main`。作業ツリーが `main` 上でクリーンなら `origin/main` に fast-forward）。Cloud のプレビルドは checkout が古い。古い `feature_list.json` を読むと完了済み ID に再着手する。
2. `.agent/progress.md` と `.agent/feature_list.json` を読む。
3. 次の対象を選ぶ: `passes` が `false` かつ `dependencies` 内の ID がすべて `true`（空なら即候補）。そのうち **ID が最小の 1 件**だけ。
4. `docs/srs.md` の該当節だけ読む。見た目の再現は `docs/design-system.md`（SRS 6 章は要約）。印刷は 5 章。seed と衝突したら seed を優先し、コードで上書きしない。
5. その 1 件だけ実装する。隣接 ID まで先回りしない。
6. 対象の `verification` を **このセッションで実行する**。F012 / F013 はファイルを一時変更するので、確認後は必ず元に戻す。
7. verifier サブエージェント（`.cursor/agents/verifier.md`）に、対象 ID と自分が走らせたコマンドを渡して判定させる。コード修正は verifier にさせない。
8. 通ったときだけ、その項目の `passes` を `true` にする。記述（name / behavior / verification 等）は変えない。
9. `.agent/progress.md` を更新する（動いているもの、次にやること、検証結果、ハマり）。

不合格なら `passes` は `false` のまま直し、6 からやり直す。

## 選ばないもの

- 依存が未完了の項目
- ユーザーが明示していない別 ID
- 非ゴール（React / Vue / Next / Tailwind / CMS / 認証 / 複数ページ）

## 触らないファイル

`contents/self-introduction.md`（F012 / F013 の一時変更を除き、終わったら戻す）, `biome.json`, `lefthook.yml`, `.vscode/*`, `LICENSE`
