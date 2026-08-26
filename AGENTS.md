# AGENTS.md

コーディングエージェント向けの入口。詳細は SRS に委譲し、ここに複製しない。

## 正本の順位

1. [docs/01-seed.md](docs/01-seed.md)
2. [docs/srs.md](docs/srs.md)
3. [.agent/feature_list.json](.agent/feature_list.json)
4. コード

衝突したら上位を直す。コードで仕様を上書きしない。

## 1 セッションの手順

1. [.agent/progress.md](.agent/progress.md) を読む
2. `feature_list.json` で `passes: false` かつ依存がすべて `true` の、ID が最小の項目を **1 つだけ** 実装する
3. その項目の `verification` を自分で実行する
4. verifier サブエージェントに判定させる（`.cursor/agents/verifier.md`）
5. 通った項目だけ `passes` を `true` にする
6. `progress.md` を更新して終わる

実装の手順詳細は `.agents/skills/implement-next-feature/SKILL.md`。

## 禁止

- `feature_list.json` の記述を変える（変えてよいのは `passes` のみ）
- verifier なしで `passes: true` にする
- 非ゴールの提案・実装（React / Vue / Next / Tailwind / CMS / 認証 / 複数ページ）
- 次を勝手に変更する: `contents/self-introduction.md`, `biome.json`, `lefthook.yml`, `.vscode/*`, `LICENSE`

## コマンド

```bash
pnpm install
pnpm dev          # http://localhost:3210 （ポート固定。フォールバックしない）
pnpm check        # 未整備なら biome check と tsc --noEmit
```

## サブエージェントとスキル

| 状況 | 使うもの |
| --- | --- |
| 完了申告の前 | verifier |
| URL・検索・ページ取得 | web-reader（親は scrape / WebFetch しない） |
| コミットを頼まれたとき | `.agents/skills/git-commit-ja` |
| 次の機能を実装するとき | `.agents/skills/implement-next-feature` |

## 変更してよいファイル

`package.json`, `pnpm-lock.yaml`, `README.md`, `src/`, Vite / TypeScript 設定、本ハーネス（ユーザー指示があるとき）。

ブランチとコミットは [CONTRIBUTING.md](CONTRIBUTING.md)。
