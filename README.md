# AI Coding Template for Cursor Users

Cursor でエージェント開発するための、ガードレール付きの土台です。アプリ本体は含みません。GitHub のテンプレートとして新規リポジトリを作り、自分のスタックを載せて使います。

狙いは「エージェントが動く」だけでなく、機密を読ませない・未審査で設定を壊させない・完了を検証することです。

## 同梱しているもの

| 領域 | 内容 |
| --- | --- |
| エージェントの境界 | `.cursorignore`、`sandbox.json`（ネットワーク既定拒否）、Hooks（機密読み取り・危険なシェル・監査・ツール出力の検査） |
| 設定の保護 | `CODEOWNERS.template`（`.cursor/` や hooks の無断変更をレビューに通す） |
| Cloud Agents | `environment.json.template`（install / 起動コマンド） |
| 完了の定義と引き継ぎ | `.agent/feature_list.json`、`.agent/progress.md` |
| サブエージェント | `verifier`（完了主張の検証）、`web-reader`（外部ページは信頼しない） |
| 開発体験 | lefthook（osv-scanner / gitleaks）、VS Code 設定、日本語 Conventional Commits スキル |

Hooks は境界ではなく補完です。決定論的な境界は `sandbox.json` と egress 制御で作ります。

## 前提条件

- [Cursor](https://cursor.com/)（Hooks / Cloud Agents / sandbox を使う想定）
- フック用の `jq`
- [lefthook](https://github.com/evilmartians/lefthook)、[gitleaks](https://github.com/gitleaks/gitleaks)、[osv-scanner](https://github.com/google/osv-scanner)（pre-commit で使用）

CODEOWNERS は GitHub Team プラン以上が必要です。Free プランでは削除してください。

## 使い方

1. GitHub の **Use this template** から新規リポジトリを作成する。
2. [Biome 関連ファイルを削除する](#biome-関連ファイル)。lefthook を有効化する。
3. 次のプレースホルダを埋め、`.template` は本番名にリネームする。`{{}}` は残さない。
4. チーム利用なら、ブランチ保護で **Require review from Code Owners** を有効化する。
5. `.agent/feature_list.json` に最初の機能（振る舞いと検証コマンド）を書く。
6. 必要なら `AGENTS.md` や `.cursor/rules` を追加する（このテンプレートには含まれない）。

### 編集するファイル

| ファイル | すること |
| --- | --- |
| `.cursor/environment.json.template` | `{{INSTALL_CMD}}` と `{{START_CMD}}` を埋め、`.cursor/environment.json` にリネームする |
| `.github/CODEOWNERS.template` | `@owner` と `{{LINT_CONFIG_FILES}}` を埋め、`.github/CODEOWNERS` にリネームする。Free プランなら削除する |
| `.cursorignore` | `{{STACK_SPECIFIC_PATTERNS}}` を自分のスタックの機密パターンに置き換える |
| `.agent/feature_list.json` | 機能名・実証可能な振る舞い・検証コマンドを書く |

### Biome 関連ファイル

`package.json`、`pnpm-lock.yaml`、`biome.json` は、このテンプレートリポジトリ自身の Cursor 設定を Biome でフォーマットするためのものです。テンプレート利用者には不要なので削除してください。あわせて `lefthook.yml` の `biome-format` と、`.vscode/` 内の Biome 向け設定も外します。

## ディレクトリ案内

```txt
- .cursor/          # hooks, sandbox, Cloud Agents, サブエージェント
- .agent/           # 完了基準とセッション引き継ぎ
- .agents/skills/   # リポジトリ同梱スキル（git-commit-ja）
- .github/          # CODEOWNERS
- .vscode/          # フォーマッタ等
```

## エージェントとの進め方

- 機能は `.agent/feature_list.json` に、実証可能な振る舞いと検証コマンドで書く。
- `passes: true` にするのは、`verifier` が検証コマンドを実行して通ったあとだけ。
- セッションを止める前に `.agent/progress.md` を更新する（次セッションは記憶ゼロ）。
- ウェブ調査は親が直接 scrape せず、`web-reader` に委譲する。
- コミット依頼時は `git-commit-ja` スキル（Conventional Commits・日本語）を使う。

## セキュリティ上の注意

- `.cursorignore` は衛生管理です。ターミナルや MCP には効きません。
- hooks の文字列マッチは回避されえます。`failClosed: true` が前提です。
- 監査ログ（`.cursor-audit.jsonl`）はプロンプトや引数を含みうるため、gitignore / cursorignore 済みです。
- `.cursor/`、hooks、CODEOWNERS を緩和する PR は、必ず人のレビューを通してください。

## カスタマイズ

このテンプレートがやらないこと: アプリ骨格、CI ワークフロー、テストランナーの固定。

足す・差し替えるもの:

- プロジェクト固有の `AGENTS.md` / Cursor rules
- スタック別の ignore パターン
- lint 設定を CODEOWNERS の `{{LINT_CONFIG_FILES}}` に反映する
- 自分のスタック向けに lefthook と VS Code 拡張を足す（Python 向けに Ruff 推奨は `.vscode/extensions.json` にある）

## コントリビューション

ブランチ命名とコミット規約は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## ライセンス

[MIT](LICENSE)
