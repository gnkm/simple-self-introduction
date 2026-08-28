# Simple Self Introduction

## 概要

マークダウンファイル( `contents/self-introduction.md` )の情報をもとに
読みやすさを優先した洗練されたデザインの自己紹介ページを作る。

## 要件

- `pnpm dev` を実行するとサーバーが起動する
- サーバーが起動して、localhost:3210 にアクセスすると `contents/self-introduction.md` の内容のウェブページが表示される
- ウェブブラウザの機能でウェブページを PDF にしたとき、用紙は縦長 A4 とする。**2 枚以上になってよい**（1 枚に収める必要はない）
- PDF ではクリック可能なリンクが失われる。frontmatter の github / blog / x は氏名の直下に出し、リンクテキストと href を同じ URL にする（GitHub / Blog / X などのラベルに置き換えない）
- 見出し 2 ごとの区切りが一目で分かる。余白を削って詰め込むより、読みやすさを優先する

## 希望技術スタック

- TypeScript
- [unifiedjs](https://github.com/unifiedjs/unified)
- Vite
- pnpm
- Biome

## デザイン方針

- 洗練された印象
- マークダウンでの箇条書きは、ウェブページにした際、1 列に表示しなくてもよい。場合によっては表にしてもよい。

## AI がやること

- [SRS](./srs.md)に要求仕様を記載する
- [タスクリスト](../.agent/feature_list.json)にタスクを記載する
- コーディングエージェントを用いた開発環境を整える(`AGENTS.md` の作成など)
- タスクリストにしたがって実装する
