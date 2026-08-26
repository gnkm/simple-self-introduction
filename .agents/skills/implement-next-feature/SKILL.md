---
name: implement-next-feature
description: Picks the next unfinished feature from feature_list.json, implements only that item, runs its verification, and hands off to the verifier before setting passes. Use when implementing the app, starting the next feature, working through the task list, or when the user says 次の機能・実装して・F001 など.
---

# 次の機能を実装する

## 手順

1. `.agent/progress.md` と `.agent/feature_list.json` を読む。
2. 次の対象を選ぶ: `passes` が `false` かつ `dependencies` 内の ID がすべて `true`（空なら即候補）。そのうち **ID が最小の 1 件**だけ。
3. `docs/srs.md` の該当節だけ読む。デザイン詳細は 6 章、印刷は 5 章。seed と衝突したら seed を優先し、コードで上書きしない。
4. その 1 件だけ実装する。隣接 ID まで先回りしない。
5. 対象の `verification` を **このセッションで実行する**。F010 / F011 はファイルを一時変更するので、確認後は必ず元に戻す。
6. verifier サブエージェント（`.cursor/agents/verifier.md`）に、対象 ID と自分が走らせたコマンドを渡して判定させる。コード修正は verifier にさせない。
7. 通ったときだけ、その項目の `passes` を `true` にする。記述（name / behavior / verification 等）は変えない。
8. `.agent/progress.md` を更新する（動いているもの、次にやること、検証結果、ハマり）。

不合格なら `passes` は `false` のまま直し、5 からやり直す。

## 選ばないもの

- 依存が未完了の項目
- ユーザーが明示していない別 ID
- 非ゴール（React / Vue / Next / Tailwind / CMS / 認証 / 複数ページ）

## 触らないファイル

`contents/self-introduction.md`（F010 / F011 の一時変更を除き、終わったら戻す）, `biome.json`, `lefthook.yml`, `.vscode/*`, `LICENSE`
