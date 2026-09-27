@AGENTS.md

# Menu Judge Next

## 概要

海外レストランのメニュー画像を Claude に解析させ、料理ごとの詳細（原語名・日本語訳・辛さ/甘さ・材料・アレルギー等）をカード表示する Web アプリ。Flask 製の `menu-judge` を Next.js（App Router）単体で作り直すプロジェクトで、最終的に Vercel へ公開する。

- 設計書: `docs/superpowers/specs/2026-09-26-menu-judge-next-design.md`
- 実装計画: `docs/superpowers/plans/2026-09-26-phase-0-1-mvp.md`

## 技術スタックと主要コマンド

TypeScript（strict）/ Next.js（App Router）/ Tailwind CSS。パスエイリアス `@/*` は `src/*` を指す。

```bash
npm run dev              # 開発サーバー
npm run build            # 本番ビルド
npm run start            # 本番サーバー起動
npm run lint             # ESLint
npm run typecheck        # next typegen && tsc --noEmit
npm run format           # Prettier で整形
npm run format:check     # Prettier のフォーマットチェック（--check）
npm run e2e              # Playwright E2E テスト（http://localhost:3100）
npm run test             # Vitest（unit + storybook の全プロジェクト）
npm run test:unit        # Vitest（src/**/*.test.ts。*.browser.test.ts を除く）
npm run test:storybook   # Vitest（Storybook の play 関数テストのみ）
npm run test:browser     # Vitest（*.browser.test.ts を Chromium で実行）
npm run storybook        # Storybook 起動
npm run build-storybook  # Storybook の静的ビルド
```

## ディレクトリ構成と Atomic Design

```
src/
├── app/[locale]/     # pages 層（Server Action 呼び出しはこの層のみ）
├── proxy.ts          # ロケール振り分け（Next 16 では middleware.ts ではなく proxy.ts）
├── components/
│   ├── atoms/        # 表示専用。翻訳・通信・localStorage に触れない
│   ├── molecules/     # 表示専用。翻訳・通信・localStorage に触れない
│   ├── organisms/     # 翻訳（useTranslations）や状態を持ってよい。"use client" はここから
│   └── templates/     # 配置のみ決定。中身は children / props（slot）で受け取る
├── lib/              # dish, prompt, analyze-result, claude, analyze-input, api-key-storage,
│                     # image, resize-image, upload-rules
├── testing/          # テスト・Storybook 専用のヘルパー（本番コードから import しない）
├── i18n/
└── messages/
```

- atoms / molecules: props でテキストを受け取るだけ。Server / Client どちらからも使える
- organisms: 状態・翻訳を持てる。`"use client"` を付けるのはこの階層から
- templates: 配置のみ。中身は `children` やスロット props
- pages（`app/[locale]/page.tsx`）: Server Action を呼ぶのはこの層のみで、下位へは関数を props で渡す（Storybook ではモック関数を渡す）

## エラー処理

Server Action（`analyzeMenu()`）は例外を投げず、判別可能な共用体型 `AnalyzeResult` を返す。

```ts
type AnalyzeResult =
  { ok: true; dishes: Dish[] } | { ok: false; code: AnalyzeErrorCode };
```

料理 1 件の検証失敗はその料理だけを除外し、残りを返す。全件除外された場合は `NOT_A_MENU`。予期しない例外は `error.tsx` で受け止める。

## セキュリティ

- APIキーはサーバーに保存せず、ログにも出力しない（ログには `code` と処理時間のみ残す）
- `lib/claude.ts` の先頭には `import "server-only"` を置き、クライアントバンドルへの混入を防ぐ
- セキュリティヘッダー（CSP など）は `next.config.ts` の `headers()` で付ける。`/en` の SSG を保つため nonce 方式は使わず、`script-src` は `'unsafe-inline'` を許可する代わりに取得元・埋め込み・送信先を絞る

## テスト方針

- `lib/`: Vitest で TDD（Red → Green → Refactor）。正常系・異常系・境界値を網羅する
- ブラウザ API（Canvas・createImageBitmap 等）を使うロジック: `*.browser.test.ts` に書き、Vitest の browser プロジェクト（Chromium）で実行する
- テスト用の画像生成などのヘルパーは `src/testing/` に置く（本番コードから import しない）
- コンポーネント: Storybook の `play` 関数による操作テスト
- 本番コードに `if (testMode)` のようなテスト用の条件分岐やマジックナンバーを入れない

## コミット規約

```
<type>: <subject>
```

Types: feat, fix, docs, style, refactor, test, chore
