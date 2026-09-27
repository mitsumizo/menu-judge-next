---
description: Generate a new UI component in the right Atomic Design layer, with its Storybook story and play-function tests. Use when adding a component.
---

# 新しいコンポーネント生成

Atomic Design の階層ルールに沿ってコンポーネントを作り、Storybook の `play` 関数でテストする。雛形と実コードが食い違ったら実コードを正とする。

## 前提（必読）

- CLAUDE.md の「ディレクトリ構成と Atomic Design」
- **既存コンポーネントの再利用を優先**。生成前に `ls src/components/*/` で既存のものを確認し、props の追加で済まないか判断する
- `any` 型禁止。デザイントークン（`bg-primary` / `text-text-secondary` など。定義は `src/app/globals.css` の `@theme`）を使い、色を直書きしない

## 手順

### Step 1: 要件と階層の決定

ユーザーから収集する: コンポーネント名 / 役割 / 受け取る props / 操作（クリック・入力など）/ 翻訳や状態が必要か。

| 階層      | 置いてよいもの                                                 | 例                        |
| --------- | -------------------------------------------------------------- | ------------------------- |
| atoms     | 表示のみ。文言は props で受け取る                              | `Button`, `Tag`           |
| molecules | atoms の組み合わせ。表示のみ。見た目のための局所的な状態だけ可 | `ApiKeyField`, `Toast`    |
| organisms | 翻訳（`useTranslations`）・状態・localStorage を扱ってよい     | `DishCard`, `AnalyzeForm` |
| templates | 配置のみ。中身は `children` やスロット props で受け取る        | `AnalyzeTemplate`         |

verify: 階層とその理由をユーザーに報告してから生成に入る。

### Step 2: 既存実装の参照

同じ階層の既存コンポーネントを 1 つ Read し、書き方（props の型定義・`className` の受け渡し・export の形）を合わせる。

- atoms の例: `src/components/atoms/Button/Button.tsx` と `Button.stories.tsx`
- organisms の例: `src/components/organisms/DishCard/DishCard.tsx`（翻訳あり。stories 用の `fixtures.ts` を持つ）

### Step 3: story（テスト）を先に書く — RED

`src/components/<階層>/<Name>/<Name>.stories.tsx` を作る。

- `play` 関数で、見た目ではなく **振る舞い** を検証する（ロールと名前で要素を取り、クリック・入力の結果を確かめる）
- 状態ごとに story を分ける（通常 / 無効 / エラー / 空 など）
- コールバックは `fn()` で受け、呼ばれた回数と引数を検証する
- verify: `npm run test:storybook` が「コンポーネントが存在しない」ことで失敗すること

### Step 4: 実装 — GREEN

`src/components/<階層>/<Name>/<Name>.tsx` を作る。

- `"use client"` は必要なときだけ付ける（Hooks やイベント処理を使うとき）
- アクセシビリティ: ボタンは `<button>`、入力にはラベル、アイコンだけの操作には `aria-label`
- verify: `npm run test:storybook` が全件パスし、`npm run typecheck` が通ること

### Step 5: 検証

```bash
npm run test:storybook   # verify: 追加した story を含めて全件パス
npm run lint             # verify: エラーなし
/dev:check-arch          # verify: CRITICAL 0 件
```

organisms で文言を追加した場合は `src/messages/*.json` にキーを追加し、すべてのロケールで同じキーがそろっていることを確認する。

## 完了報告

作成したファイルのパス、選んだ階層とその理由、story の一覧とテスト結果を報告する。コミットはユーザーの指示があった場合のみ（`feat: Add <Name> <layer>` の形式・英語）。
