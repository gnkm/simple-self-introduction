# Simple Self Introduction

## 概要

マークダウンファイル( `contents/self-introduction.md` )の情報をもとに
一枚でできた洗練されたデザインの自己紹介ページを作る。

## 要件

- `pnpm dev` を実行するとサーバーが起動する
- サーバーが起動して、localhost:3210 にアクセスすると `contents/self-introduction.md` の内容のウェブページが表示される
- ウェブブラウザの機能でウェブページを PDF にしたとき、縦長 A4 1 枚に収まる

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
