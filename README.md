# Simple Self Introduction

マークダウンファイルの情報をもとに、一枚でできた洗練されたデザインの自己紹介ページを作る。

## 起動

```bash
pnpm install
pnpm dev
```

[http://localhost:3210](http://localhost:3210) が `contents/self-introduction.md` のページを返す。

## 品質確認

```bash
pnpm check
```

`check` は Biome と `tsc --noEmit` を実行する。

## PDF

Chrome の印刷 → PDF に保存。用紙は A4・縦。ダイアログで **ヘッダーとフッターをオフ**にする。
