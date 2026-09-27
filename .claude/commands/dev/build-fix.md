---
description: Fix TypeScript/build errors step by step with minimal changes. Use when npm run typecheck or npm run build fails.
---

# Build Fix

型エラー・ビルドエラーを 1 件ずつ、最小の差分で解消せよ。

## 手順

1. **現状把握**: `npm run typecheck` と `npm run build` を実行し、エラーを全件収集する
   - verify: 各エラーのファイルパスと原因の種類（型の不一致・import 解決・Server/Client 境界・ビルド時の静的生成など）を一覧にできていること

2. **生成物の罠を先に潰す**
   - `LayoutProps` / `PageProps` など Next.js が自動生成する型が見つからない → `npx next typegen` を実行する（`npm run typecheck` には含まれている）
   - 古い生成物が疑わしい → `.next/` を削除してから再実行する
   - verify: 再度 `npm run typecheck` を実行する。生成物が原因ならこの時点でエラーが消える（コード修正不要で終了）

3. **1 件ずつ修正する**
   - 修正のたびに `npm run typecheck` で再検証する
   - Next.js 特有のエラーは `node_modules/next/dist/docs/` の該当ガイドを読んでから直す（学習データの知識と挙動が違うことがある）
   - よくある原因:
     - Client Component から `server-only` のモジュール（`src/lib/claude.ts` など）を import している
     - Server Component で `useState` などの Hooks を使っている（`"use client"` の付け忘れ）
     - `/[locale]` の静的生成中に、リクエスト時にしか使えない API を呼んでいる

4. **全解消後の最終確認**
   - verify: `npm run typecheck`・`npm run build`・`npm run test` がすべて成功すること

## 停止条件（即座に中断してユーザーに報告）

- 修正が新しいエラーを生んだ場合（その修正は戻す）
- 同じエラーに 3 回試しても解決しない場合
- 修正に構成の変更（Atomic Design の階層・Server/Client の境界・ディレクトリ構成）が必要な場合 → 修正せず、方針をユーザーに相談する

## しないこと

- 無関係なコードのリファクタリングやスタイル修正
- `any` や `as unknown as` による型エラーの握り潰し、`@ts-ignore` / `@ts-expect-error` での黙殺
