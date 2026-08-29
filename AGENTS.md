# AGENTS.md

コーディングエージェント向けの入口。詳細は SRS に委譲し、ここに複製しない。

## 正本の順位

1. [docs/01-seed.md](docs/01-seed.md)
2. [docs/srs.md](docs/srs.md)
3. [docs/design-system.md](docs/design-system.md)（見た目の再現。機能要求は SRS）
4. [.agent/feature_list.json](.agent/feature_list.json)
5. コード

衝突したら上位を直す。コードで仕様を上書きしない。

## 1 セッションの手順

1. **最新の default branch を取り込む**（Cloud Agent / スナップショット起動では必須）。`.cursor/sync-latest-main.sh` を実行する。未実行なら `git fetch origin main` のあと、作業ツリーが `main` 上でクリーンなら `git merge --ff-only origin/main`。古い `.agent/feature_list.json` を読むと完了済みタスクに再着手する
2. [.agent/progress.md](.agent/progress.md) を読む
3. `feature_list.json` で `passes: false` かつ依存がすべて `true` の、ID が最小の項目を **1 つだけ** 実装する
4. その項目の `verification` を自分で実行する
5. verifier サブエージェントに判定させる（`.cursor/agents/verifier.md`）
6. 通った項目だけ `passes` を `true` にする
7. `progress.md` を更新して終わる

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

## Cursor Cloud specific instructions

プレビルド Environment Build は作業ツリー（`gitSetup: reuse`）を使い回す。ローカル `main` は remote より数コミット古いことがある。

- 環境の `start` が `.cursor/sync-latest-main.sh` を実行する。ログは `/tmp/cursor/sync-latest-main.log`
- `start` 未実行・失敗・feature ブランチ継続のときは、実装対象を選ぶ前に自分で同スクリプトを実行する
- feature ブランチ上では working tree を `main` に戻さない。分岐は `origin/main` から行う
- ダッシュボードの Builds で Update stale builds を有効にし、Staleness threshold を `0` にすると、起動時に Cursor 側でも latest default branch を pull する
