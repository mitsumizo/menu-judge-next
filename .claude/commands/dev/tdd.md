---
description: Enforce the TDD workflow (RED → GREEN → REFACTOR). Use at the start of a new feature, a bug fix, or logic in src/lib.
---

# TDD

`$ARGUMENTS` の実装対象をテスト駆動で開発せよ。テスト方針の正は CLAUDE.md の「テスト方針」。着手前に必ず読むこと。

## テストの置き場所（実装の種類で決まる）

| 実装の種類                                              | テストファイル                                                  | 実行コマンド             |
| ------------------------------------------------------- | --------------------------------------------------------------- | ------------------------ |
| `src/lib/` の純粋なロジック                             | 実装と同階層の `xxx.test.ts`                                    | `npm run test:unit`      |
| ブラウザ API（Canvas・createImageBitmap 等）を使う処理  | 実装と同階層の `xxx.browser.test.ts`                            | `npm run test:browser`   |
| コンポーネント                                          | 同じディレクトリの `Xxx.stories.tsx` の `play` 関数             | `npm run test:storybook` |
| ページをまたぐ操作・画面遷移                            | `e2e/*.spec.ts`（Playwright）                                   | `npm run e2e`            |

テスト用の画像生成などのヘルパーは `src/testing/` に置く（本番コードから import しない）。

## 手順

1. **インターフェース定義**: 入出力の型を先に定義する
   - verify: `npm run typecheck` が通ること（実装は `throw new Error("Not implemented")` でよい）

2. **RED**: 失敗するテストを書く。正常系・異常系・境界値を含める
   - verify: テストを実行し「正しい理由で」失敗すること（Not implemented やアサーション失敗。import エラーでの失敗は不可）

3. **GREEN**: テストを通す最小限の実装を書く
   - verify: 対象テストが全件パスすること

4. **REFACTOR**: テストを通したまま改善する
   - verify: リファクタ後も対象テストと `npm run test:unit` が全件パスすること

5. **カバレッジ確認**（`src/lib/` を変更した場合）: `/dev:coverage` を実行する
   - verify: 追加・変更した関数の分岐がすべてテストされていること。不足があれば手順 2 に戻る

## 失敗時の分岐

- GREEN にできない → 実装を疑う前に、テストの期待値が仕様（設計書・Issue）と合っているか確認する。仕様が不明なら中断してユーザーに質問する
- 既存テストが巻き添えで落ちた → 自分の変更を戻して原因を切り分けてから再開する

## 禁止

- RED フェーズのスキップ（テストより先に実装を書かない）
- 落ちたテストの skip や、期待値の書き換えによる帳尻合わせ
- `expect(true).toBe(true)` のような意味のないアサーション
- 本番コードへの `if (testMode)` のようなテスト用分岐やマジックナンバー
