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

## Cloudflare Pages へのデプロイ

`pnpm build` の `dist/`（完成 HTML と CSS）を公開する。公開 URL はサイトルート（`*.pages.dev`）なので、CSS の `/page.css` はそのままでよい。

前提: Node.js 22.12 以上、pnpm、[Cloudflare アカウント](https://dash.cloudflare.com/)。上げる前に手元で次を確認する。

```bash
pnpm install
pnpm build
pnpm preview
```

[http://localhost:4173](http://localhost:4173) が自己紹介ページであること。

Git 連携と CLI（Direct Upload）は **同じプロジェクトでは切り替えられない**。継続公開なら Git、一度だけなら CLI。

### Git 連携（継続公開）

1. [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) で **Create application** → **Pages** → **Connect to Git**（表記が **Import an existing Git repository** のこともある）
2. GitHub でこのリポジトリを選び、**Install & Authorize** → **Begin setup**
3. **Set up builds and deployments** で次を入れる

   | 項目 | 値 |
   | --- | --- |
   | Project name | `simple-self-introduction`（`wrangler.jsonc` の `name` と同じ） |
   | Production branch | `main` |
   | Build command | `pnpm build` |
   | Deploy command | `npx wrangler deploy`（Workers Builds の既定。空にしない） |
   | Root directory (advanced) | **空のまま**（リポジトリルート。`dist` を書かない） |

`dist/` は git に含まれない。**Root directory** に `dist` を入れると、クローン直後に `Failed: root directory not found` で止まる。出力先は `wrangler.jsonc` の `assets.directory`（`./dist`）で、ビルド後に `wrangler deploy` がそこを上げる。

Git 連携はビルドのあと `npx wrangler deploy` を走らせる。`pages_build_output_dir` だけだと Worker の入口が無く `Missing entry-point` で落ちる。

4. **Environment variables** に `PNPM_VERSION` = `10.33.3` を足す（`package.json` の `packageManager` と揃える）。Node は Pages の既定が 22 で足りる。変えるなら `NODE_VERSION` = `22`
5. **Save and Deploy**。成功すると `https://simple-self-introduction.pages.dev`（名前が使われていれば接尾辞が付く）
6. 以降は `main` への push で本番が更新される。PR にはプレビュー URL が付く（fork の PR は対象外）

### CLI（手元から一度上げる）

```bash
pnpm wrangler login
pnpm pages:deploy
```

ブラウザで Cloudflare にログインする。初回はプロジェクト名を聞かれる（`simple-self-introduction`）。公開 URL は Git 連携と同じ形。

## PDF

Chrome の印刷 → PDF に保存。用紙は A4・縦。ダイアログで **ヘッダーとフッターをオフ**にする。背景グラフィックはオフでよい。1 枚に収めなくてよい。

配布するときは、テキストが選択できる状態のまま保存する（画像化しない）。ファイル名の例: `gnkm-profile-202608.pdf`。ビューアのタブ名は HTML の `<title>`（氏名）になる。
