---
description: Measure test coverage of src/lib with Vitest, summarise it, and list low-coverage files with suggested test cases.
---

# テストカバレッジ取得

## 使い方

```
/dev:coverage            # src/lib 全体（デフォルト）
/dev:coverage <パス>     # 例: src/lib/claude.ts
```

## 手順

1. **対象の決定**: `$ARGUMENTS` が空なら `src/lib/**`、パスが指定されていればそのパス

2. **カバレッジ実行**（`@vitest/coverage-v8` を使う）

   ```bash
   npx vitest run --project unit --coverage --coverage.include='src/lib/**'
   ```

   - パス指定時は `--coverage.include` をそのパスに変える
   - `--project browser` は付けない。browser モードでは `@vitest/coverage-v8` の読み込みに失敗し（`Failed to fetch dynamically imported module`）、正しい数値が取れない
   - verify: 出力末尾にカバレッジ表（% Stmts / % Branch / % Funcs / % Lines）が表示されること
   - テストが失敗した場合: 失敗したテストを先に報告する。カバレッジの数値は参考値として扱い、判断には使わない

3. **サマリー表示**: 全体の Statements / Branches / Functions / Lines と、Lines が低いファイル上位 5 件を表で示す

4. **評価**
   - このプロジェクトにはカバレッジの数値基準が決まっていない。**目安として Lines・Branches とも 80%** で評価し、未達でも失敗扱いにはせず報告する
   - 未カバーの行のうち、エラー処理（`AnalyzeResult` の `ok: false` を返す分岐）・入力チェック・APIキーの扱いに関わるものを優先して、追加すべきテストケース（入力と期待する出力）を提示する

## 出力ファイル

- `coverage/`（`coverage/index.html` に HTML レポート。`.gitignore` 済み）

## 注意

- コンポーネントは Storybook の `play` 関数でテストしているため、この数値には含めない
- `*.browser.test.ts` でだけテストしているファイル（`resize-image.ts` など）は 0% と表示される。評価の対象から外し、その旨をレポートに書く
- 型と定数だけのファイル（`analyze-result.ts` など）は、テストから型しか import されないと 0% になる。ロジックがなければ問題として扱わない
