---
description: Generate a new src/lib module (zod schema or pure logic) test-first, with co-located Vitest tests. Use when adding domain logic, validation, or a data model.
---

# lib モジュール生成

`src/lib/` にスキーマや純粋なロジックを TDD で追加する。このコマンドは手順と検証だけを持つ。書き方の正は既存の `src/lib/*.ts`。

## 前提（必読）

- `src/lib/` は React に依存しない。画面・翻訳・localStorage に直接触れる処理は organisms やフックに置く
- 外部入力（Claude の応答・ユーザーの入力）は **zod で検証** してから使う
- サーバー専用の処理（APIキーを使う通信など）はファイル先頭に `import "server-only"` を置く
- 失敗は例外ではなく、判別可能な共用体（`{ ok: true; ... } | { ok: false; code }`）で返すのが基本（`src/lib/analyze-result.ts` 参照）

## 手順

### 1. 情報収集

ユーザーから収集する: モジュール名 / 公開する関数・型 / 入力と出力 / 検証ルール（必須・文字数・範囲・形式）/ 失敗時に返すもの。

verify: 設計書（`docs/superpowers/specs/`）に関連する記述があれば読み、食い違いがないことを確認する。食い違う場合は中断してユーザーに確認する。

### 2. 既存実装の参照

生成前に実在コードを読み、現行パターンに合わせる。

- **zod スキーマと型の同時定義**: `src/lib/dish.ts` と `dish.test.ts`
- **入力チェック（判別可能な共用体で返す）**: `src/lib/analyze-input.ts` と `analyze-input.test.ts`
- **外部 API の呼び出しとエラー変換**: `src/lib/claude.ts` と `claude.test.ts`
- **ブラウザ API を使う処理**: `src/lib/resize-image.ts` と `resize-image.browser.test.ts`

verify: `ls src/lib/` で参照ファイルの存在を確認する（名前が変わっていたら実在するものを使う）。

### 3. テスト生成 — RED（実装と同階層・厳守）

配置: `src/lib/<name>.test.ts`（ブラウザ API を使うなら `<name>.browser.test.ts`）。

必ずカバーする:

- **正常系**: 代表的な入力で期待どおりの出力になる
- **異常系**: 必須項目の欠落・空文字・空白だけ・型違い・範囲外
- **境界値**: 上限ちょうどは OK、上限 + 1 はエラー（下限も同様）
- **失敗時の戻り値**: どのエラーコードが返るか

verify: `npm run test:unit -- <name>` が「正しい理由で」失敗すること

### 4. 実装 — GREEN / REFACTOR

- 定数（上限値など）は 1 か所に定義し、テストからも同じ定数を参照する
- verify: `npm run test:unit -- <name>` が全件パスすること

### 5. 検証

```bash
npm run test:unit      # verify: 既存テストを含めて全件パス
npm run typecheck      # verify: 型エラーなし
/dev:coverage src/lib/<name>.ts   # verify: 追加した分岐がすべてテストされている
```

検証ルールを既存のものから変えた場合は、実装前にテストのフィクスチャ（`src/components/**/fixtures.ts`・`src/testing/`・各テストの入力データ）を横断検索し、影響するデータを先に更新する。

### 6. 次のステップ

- 画面から使う場合は `/dev:new-component` に進む
- コミットはユーザーの指示があった場合のみ（`feat: Add <name> ...` の形式・英語）
