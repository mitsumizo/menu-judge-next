---
description: Duplicate code detection and consolidation based on the Rule of Three. Use when you want to find duplication occurring 3+ times across the codebase and factor it out.
---

# 重複コード検出・共通化

Rule of Three（同じものが 3 回出てきたら共通化する）に基づいて重複を探し、共通化する。

使い分け: 手元の diff の整理はビルトインの `/simplify`、コードベース全体の重複検出は本コマンド。

## 使い方

```
/dev:refactor-duplicate [対象ディレクトリ]
```

引数を省略した場合は `src/` を対象とする。

## 手順

1. **検出**: 次のような重複を探す（grep は macOS の BSD grep を前提に `-E` を使い、`-P` は使わない）
   - 同じ Tailwind クラスの長い組み合わせ（例: カードや入力欄の見た目）
   - 同じ zod スキーマの断片・同じ検証ロジック
   - 同じ `play` 関数の操作手順（stories 間）
   - 同じエラーコードから文言への変換
   - verify: 各候補に「ファイルパス + 行番号」が 3 か所以上あること。2 か所以下は Rule of Three 未達として提案から外す

2. **報告と確認**: 重複箇所と共通化案（抽出する関数・コンポーネント名、置き場所、理由）を優先度順に示し、実施範囲をユーザーに確認する
   - 置き場所は Atomic Design のルールに従う（見た目の共通化なら atoms / molecules、ロジックなら `src/lib/`、テスト用なら `src/testing/`）
   - 勝手に全件をリファクタしない

3. **実施**（ユーザーが承認した範囲のみ）
   - 共通化したものにテストを追加する（ロジックは Vitest、コンポーネントは story の `play`）
   - 既存コードを共通化したものの呼び出しに置き換える
   - verify: `npm run test`・`npm run typecheck`・`npm run lint` がすべて成功すること

4. **完了報告**: 解消した重複の件数・削減した行数・新しく作ったファイルのパスを報告する

## 失敗時の分岐

- 置き換え後にテストが落ちた → その置き換えだけ戻し、「共通化すべきでないケース」（たまたま同じ形・過度な抽象化）に当たらないか判定し直す
- 共通化したもののパラメータが 5 個以上に膨らむ → 共通化をやめ、個別の実装のままにすることを報告する
