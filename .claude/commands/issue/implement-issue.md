---
description: Implement a given issue in a worktree - the careful variant, pausing for manual verification and review after the TDD implementation. Use for issues you want to check with your own eyes as you go.
---

Issue #$ARGUMENTS を Git worktree で実装してください。

## 実装手順

### 1. Issue の把握

- `gh issue view $ARGUMENTS` で本文・受け入れ基準を取得する
- 関連する設計書（`docs/superpowers/specs/`）と計画書（`docs/superpowers/plans/`）の該当箇所を読む
- 受け入れ基準が曖昧な場合は、実装前にユーザーに確認する

### 2. Worktree 作成

今のチェックアウトのブランチは切り替えない。worktree は `origin/main` から作る。

```bash
git fetch origin main
git worktree add .claude/worktrees/issue-$ARGUMENTS -b feature/issue-$ARGUMENTS origin/main
```

- 同名のブランチがすでにある場合は、中身（未マージのコミットがないか）を確認してからユーザーに削除の可否を聞く
- verify: `git worktree list` に `.claude/worktrees/issue-$ARGUMENTS` が表示される

### 3. Worktree 環境の設定

- 作成した `.claude/worktrees/issue-$ARGUMENTS` に移動する
- `npm ci` で依存関係を入れる（husky の Git フックもここで有効になる）
- verify: `npm run typecheck` が通る

### 4. 実装（TDD + 段階ごとの検証）

**テスト駆動開発で実装すること**（手順は `/dev:tdd` に従う）。

#### 事前チェック: テストフィクスチャの影響調査

検証ルールや `Dish` の項目・エラーコードを変える場合は、**実装前に**テストのフィクスチャ・モックデータ（`src/components/**/fixtures.ts`・`src/testing/`・各テストの入力）を横断検索し、影響するデータを先に更新する。

#### 実装の順序（厳守）

各段階が終わるごとに検証し、**失敗したら次の段階に進まず修正する**。

1. **lib**（`src/lib/`）: スキーマ・ロジック・Claude 呼び出し
   - verify: `npm run test:unit`（ブラウザ API を使うなら `npm run test:browser` も）と `npm run typecheck`
2. **コンポーネント**（atoms → molecules → organisms → templates の順）: 各 story の `play` 関数でテストする
   - verify: `npm run test:storybook` と `npm run typecheck`
3. **ページ・Server Action・文言**（`src/app/[locale]/`・`src/messages/`）
   - verify: `npm run build` と `npm run e2e`

関係しない段階はスキップしてよい。

### 5. 動作確認（手動）

- `npm run dev` を**バックグラウンドで**起動する（Bash ツールの `run_in_background: true` を使う）
- verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/en` が 200 を返す（起動直後は数秒待つ）
- ユーザーに次のように伝えて待つ:

  ```
  開発サーバーを起動しました。
  http://localhost:3000/en で動作確認をお願いします。

  確認が終わったら「確認OK」と入力してください。
  問題があれば具体的に教えてください。
  ```

- 「確認OK」が来るまで待つ。問題があれば修正し、もう一度確認してもらう
- **確認後は開発サーバーを必ず止める**: バックグラウンドのプロセスを終了し、`lsof -ti:3000` で残っていないことを確かめる

### 6. コードレビュー（コミット前）

- `git status` と `git diff origin/main` で変更を確認する
- Agent ツールでレビュー用のサブエージェントを起動する（**常に実行**）。観点は `/issue:implement-issue-auto` の「観点別の判定基準」のうち、コード品質・要件適合性・テスト品質
- APIキー・画像の受け付け・Claude への送信・セキュリティヘッダーに触れる変更がある場合は、セキュリティ観点のサブエージェントを**同じメッセージ内で並列に**起動する
- 委譲するプロンプトには必ず次を含める（サブエージェントは会話の文脈を共有しない）:
  - worktree の絶対パス
  - 変更ファイル一覧（`git diff --name-only origin/main`）
  - Issue 番号と受け入れ基準の要約
  - 出力形式: 各指摘に `[Critical|Major|Minor]` のラベルを付ける
- Critical / Major は必ず修正し、直した箇所だけ再レビューを受ける（0 件になるまで繰り返す）
- verify: 最終レビュー結果の Critical / Major が 0 件

### 7. コミットとプッシュ

- 意味のある単位で小刻みにコミットする。形式は `<type>: <subject>`（英語。例: `feat: Add price filter to DishList`）
- `git push -u origin feature/issue-$ARGUMENTS`
- verify: `git status` がクリーンで、リモートにコミットが反映されている

### 8. PR 作成前チェック

`/pr:pre-pr-check` を実行し、すべてパスするまで修正する。

### 9. PR 作成

```bash
gh pr create --title "<type>: <English summary>" --body "$(cat <<'EOF'
## 概要
- [実装内容の要約]

## 関連 Issue
closes #$ARGUMENTS

## 確認したこと
- [テスト・手動確認の項目]
EOF
)"
```

### 10. 完了報告

- 実装内容のサマリー
- 作成した PR の URL
- マージ後は `git worktree remove .claude/worktrees/issue-$ARGUMENTS` で worktree を片付けられることを伝える

## 注意事項

- レビューで Critical / Major があった場合は、直してから次に進む
- 動作確認で問題の報告があった場合は、直してから次に進む
- 動作確認なしで一気に進めたい場合は `/issue:implement-issue-auto` を使う
