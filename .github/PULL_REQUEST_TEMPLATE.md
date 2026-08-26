## 概要

<!-- なぜこの変更が必要か。何をしたかは差分から読めるので最小限でよい。 -->

-

## 関連

<!-- 該当する feature ID。無ければ「なし」。 -->

- F0

## 対応 Issue

<!--
  マージ（default branch への取り込み）で Issue を自動 close する。
  キーワードは Closes / Fixes / Resolves。番号を書く。
  対応 Issue が無ければこの節ごと削除する（空の Closes # は残さない）。
-->

Closes #

## 確認

- [ ] `pnpm check` が通る（未整備なら `biome check` と `tsc --noEmit`）
- [ ] `pnpm dev` で http://localhost:3210 が想定どおり表示される
- [ ] Chrome 印刷プレビュー（A4 縦、ヘッダーとフッター off）で 1 ページに収まる（表示・スタイルを変えた場合）
- [ ] `.agent/feature_list.json` の `passes` を true にした項目は、verifier が verification を実行済み

## エージェントハーネス

<!-- 触っていなければ「変更なし」。 -->

- [ ] `AGENTS.md` / `.cursor/` / `.agent/` / `.agents/` / `lefthook.yml` / `biome.json` を緩める変更は意図どおりで、レビュー対象だと分かっている

## Stacked PR

<!-- `main` 以外が base のときだけ書く。 -->

- 上流ブランチ:
