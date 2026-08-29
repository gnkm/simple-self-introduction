# ディレクトリ構成

この文書は、リポジトリの配置と各ファイルの役割を示す。製品の要求は [docs/srs.md](docs/srs.md)、意図の起点は [docs/01-seed.md](docs/01-seed.md)、見た目の再現は [docs/design-system.md](docs/design-system.md) が正本である。起動手順は [README.md](README.md)。

`node_modules/`、`dist/`、`.pnpm-store/`、`.git/` は生成物・依存のため省略する。

## 実行時の流れ

`pnpm dev` → Vite（ポート 3210）→ `selfIntroPlugin` が `GET /` を横取りする。ブラウザは Markdown を再取得しない。完成 HTML はサーバ側で組み立てる。

```text
contents/self-introduction.md
        │
        ▼
src/markdown/readSource.ts          ファイル読取
        │
        ▼
src/markdown/convertMarkdown.ts     mdast → hast → HTML 文字列
        │
        ▼
src/render/pageHtml.ts              ヘッダ＋本文の完成 HTML
        │
        ▼
http://localhost:3210/              text/html
```

`pnpm build` は同じ変換を `dist/index.html` と CSS（`page.css` / `list-layout.css`）に書く。Cloudflare Pages はこの `dist/` を公開する。

入力が壊れているときは、開発サーバは `src/render/errorPage.ts` が 500 の HTML を返す。ビルドは非 0 で失敗する。

`index.html` と `src/main.ts` は Vite が入口として要求するプレースホルダである。完成ページの中身はプラグインが返す。

## リポジトリ全体

```text
.
├── AGENTS.md                       コーディングエージェント向けの入口。仕様は SRS に委譲
├── ARCHITECTURE.md                 本ファイル。配置と責務
├── CONTRIBUTING.md                 ブランチ名・コミットメッセージの規約
├── LICENSE                         ライセンス（エージェントは変更しない）
├── README.md                       起動・検査・PDF 保存・Cloudflare Pages の手順
├── biome.json                      Biome（lint / format）。エージェントは変更しない
├── lefthook.yml                    pre-commit（format / 脆弱性スキャン / 秘密検出）
├── package.json                    スクリプトと依存。dev / build / preview / check / pages:deploy
├── pnpm-lock.yaml                  pnpm の lock
├── tsconfig.json                   TypeScript。strict、src のみ include、emit しない
├── vite.config.ts                  開発サーバ。ポート 3210 固定、localhost のみ、プラグイン登録
├── wrangler.jsonc                  Cloudflare。静的アセットは dist
├── index.html                      Vite の HTML 入口。完成ページはプラグインが上書き
├── contents/                       表示する本文。アプリが探索するのはここだけ
│   └── self-introduction.md        唯一のコンテンツ源。frontmatter + Markdown
├── docs/                           製品仕様
│   ├── 01-seed.md                  意図の起点。SRS と衝突したらこちらを優先
│   ├── srs.md                      実装・検証の契約
│   └── design-system.md            色・活字・余白・部品。見た目の再現仕様
├── src/                            アプリ本体（詳細は次節）
├── .agent/                         実装ループの進捗（仕様の正本ではない）
│   ├── feature_list.json           E2E で確認できる作業単位。変えてよいのは passes のみ
│   └── progress.md                 セッション間の作業メモ
├── .agents/                        エージェント用スキル
│   └── skills/
│       ├── git-commit-ja/          Conventional Commits（日本語）でコミットする
│       └── implement-next-feature/ 未完了 feature を 1 件だけ実装する
├── .cursor/                        Cursor / Cloud Agent 向けのハーネス
│   ├── agents/
│   │   ├── verifier.md             完了申告の前に verification を実行して判定する
│   │   └── web-reader.md           URL・検索・ページ取得を親の代わりに行う
│   ├── hooks/                      ツール実行前後のガードと監査
│   │   ├── audit.sh                ツール利用を監査ログへ残す
│   │   ├── guard-read.sh           機密ファイルの読み取りを拒否する
│   │   ├── guard-shell.sh          危険なシェルと保護ブランチへの push を拒否する
│   │   └── inspect-tool-output.sh  ツール出力に秘密が混ざっていないか見る
│   ├── rules/
│   │   └── agent-loop.mdc          実装ループの固定ルール
│   ├── environment.json            Cloud の install / start / 開発サーバ
│   ├── hooks.json                  上記 hooks の登録
│   ├── sandbox.json                ワークスペースのネットワーク許可リスト
│   └── sync-latest-main.sh         origin/main を取り込んで古い feature_list を避ける
├── .cursorignore                   エージェントのコンテキストから除外するパス
├── .gitignore                      node_modules / dist / 秘密ファイルなど
├── .vscode/                        編集環境。エージェントは変更しない
│   ├── extensions.json             推奨拡張（Biome）
│   └── settings.json               保存時 format、Biome を既定フォーマッタに
└── .github/
    ├── CODEOWNERS                  ハーネス・検査設定の変更にレビューを要求する
    ├── PULL_REQUEST_TEMPLATE.md    PR 本文の型
    └── workflows/
        └── ci.yml                  PR と main への push で pnpm check と pnpm build
```

## `src/` — アプリ本体

SRS 2.5 の責務分けに従う。

- I/O（ファイル読み込み、Vite フック）は `markdown/readSource.ts` と Vite プラグインに閉じる
- Markdown → 構造 → HTML は純関数
- `render/` は文字列の HTML を組み立てるだけで、ファイルを読まない

```text
src/
├── main.ts                         ブラウザ側の入口。空のモジュール（プレースホルダ）
├── vite-plugin-self-intro.ts       GET / と dist に完成 HTML を出す。CSS 配信と Markdown 変更時の再読込
├── markdown/                       読取・解析・AST 変換。unified パイプライン
│   ├── convertMarkdown.ts          変換の入口。下のモジュールを順に呼ぶ
│   ├── readSource.ts               contents/self-introduction.md のパス解決と読取
│   ├── parseMarkdown.ts            remark-parse + remark-frontmatter で mdast にする
│   ├── frontmatter.ts              YAML から name / github / blog / x を取る
│   ├── expandName.ts               本文・見出しの {name} を frontmatter.name で置換
│   ├── prepareBodyAst.ts           YAML ノードと見出し 1 を除く（氏名はページヘッダへ）
│   ├── autolinkHttpUrls.ts         素の http(s) URL を link ノードにする
│   ├── collapseCjkLineBreakSpaces.ts 和文改行由来の半角スペースを除去
│   ├── wrapHeading2Sections.ts     見出し 2 ごとに section で囲む
│   ├── densifyLists.ts             箇条書きを表・タグ・グリッドへ置き換える
│   ├── wrapHeading3Blocks.ts       見出し 3 をブロック化し、連続ブロックをグリッドにする
│   └── markExternalLinks.ts        外部リンクに target / rel を付ける。空 href は除去
├── render/                         完成 HTML の文字列化。I/O しない
│   ├── pageHtml.ts                 正常時の文書（title・ヘッダ・本文・CSS リンク）
│   ├── errorPage.ts                入力異常時の文書とメッセージ整形
│   ├── escapeHtml.ts               テキストを HTML へ埋め込むときのエスケープ
│   └── externalLink.ts             http(s) かどうかと target / rel の定数
└── styles/                         プレーン CSS。画面と印刷
    ├── page.css                    色・活字・余白・セクション・印刷（A4 縦）
    └── list-layout.css             タグ・スキル・資格などリスト置換後のレイアウト
```

### `convertMarkdown.ts` の順序

正規表現で Markdown 全体を HTML にはしない。unified の AST を順に加工する。

1. `parseMarkdown` — Markdown 文字列 → mdast
2. `extractFrontmatter` — YAML ノード → オブジェクト
3. `expandNamePlaceholder` — `{name}` の展開
4. `removeYamlAndTitleHeadings` — YAML と見出し 1 を除去
5. `collapseCjkLineBreakSpaces` — 和文の段落内改行由来の半角スペースを除去
6. `autolinkHttpUrls` — 素の URL を link にする（表示はスキームなし可）
7. `remark-rehype` — mdast → hast（生 HTML は通さない）
8. `wrapHeading2Sections` — `h2` 単位の `section`
9. `densifyLists` — リストの見た目用構造（見出し名での分岐は「資格」「スキル」と見出し 4「課金中のサービス」のみ）
10. `wrapHeading3Blocks` — `h3` ブロックとグリッド
11. `markExternalLinks` — 外部リンク属性
12. `rehype-stringify` — hast → `bodyHtml` 文字列
