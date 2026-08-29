# Simple Self Introduction

マークダウンファイルの情報をもとに、読みやすさを優先した洗練されたデザインの自己紹介ページを作る。印刷は A4 縦。2 枚以上になってよい。見た目の再現は [docs/design-system.md](docs/design-system.md)。

## 起動

```bash
pnpm install
pnpm dev
```

[http://localhost:3210](http://localhost:3210) が `contents/self-introduction.md` のページを返す。開発サーバのポートは 3210 に固定する。

## 検査

```bash
pnpm check
```

Biome と TypeScript（`tsc --noEmit`）を実行する。本番ビルドは `pnpm build`。成果物は `dist/`（完成 HTML と CSS）。ローカル確認は `pnpm preview`。

## Cloudflare Pages

`pnpm build` の `dist/` を静的サイトとして公開する。URL はサイトルート（`*.pages.dev`）なので、CSS の `/page.css` はそのままでよい。

### Git 連携（継続公開）

1. [Cloudflare dashboard](https://dash.cloudflare.com/) の Workers & Pages で Pages プロジェクトを作り、この GitHub リポジトリを接続する
2. Build command は `pnpm build`、Build output directory は `dist`
3. 環境変数 `PNPM_VERSION` を `10.33.3` にする（`package.json` の `packageManager` と揃える）
4. Save and Deploy。以降は `main` への push で公開される

`wrangler.jsonc` の `pages_build_output_dir` は `./dist`。プロジェクト名は `simple-self-introduction`。

### CLI（手元から一度上げる）

```bash
pnpm wrangler login
pnpm pages:deploy
```

初回は Cloudflare がプロジェクト作成を確認する。公開 URL は `https://simple-self-introduction.pages.dev`（名前が使われていれば接尾辞が付く）。

## PDF

Chrome の印刷 → PDF に保存。用紙は A4・縦。ダイアログで **ヘッダーとフッターをオフ**にする。背景グラフィックはオフでよい。1 枚に収めなくてよい。

配布するときは、テキストが選択できる状態のまま保存する（画像化しない）。ファイル名の例: `gnkm-profile-202608.pdf`。ビューアのタブ名は HTML の `<title>`（氏名）になる。
