# Simple Self Introduction

マークダウンファイルの情報をもとに、読みやすさを優先した洗練されたデザインの自己紹介ページを作る。印刷は A4 縦。2 枚以上になってよい。

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

Biome と TypeScript（`tsc --noEmit`）を実行する。本番ビルドは `pnpm build`。

## PDF

Chrome の印刷 → PDF に保存。用紙は A4・縦。ダイアログで **ヘッダーとフッターをオフ**にする。1 枚に収めなくてよい。
