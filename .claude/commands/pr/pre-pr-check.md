---
description: Pre-PR check - runs the lockfile integrity check, lint, format check, type check, tests, build, E2E, conflict check, and documentation update check. Run immediately before creating a PR.
---

# PR 作成前チェック

PR 作成前に、CI（`.github/workflows/ci.yml`）と同じチェックを手元で実行する。エラーが出た時点で原則中断し、修正してから再実行する。

## 手順

以降のコマンドはリポジトリのルートで実行する（ルートは `git rev-parse --show-toplevel` で求める。絶対パスを決め打ちしない）。

### 1. 現在の状態確認

- 現在のブランチ名を取得する（`main` なら警告して中断）
- 未コミットの変更を確認する（`git status --short`）
- 未プッシュのコミットを確認する（`git log origin/$(git branch --show-current)..HEAD --oneline`。リモートブランチが未作成ならその旨を表示）

未コミットの変更がある場合はユーザーに通知し、コミットしてから再実行するよう促す（手順 8 の dry-run merge が実行できないため）。

### 2. lockfile の整合性確認

```bash
npm ci --dry-run
```

- verify: エラーなく完了すること
- 不整合（`Missing:` / `Invalid:`）の場合: `npm install` で `package-lock.json` を更新し、再度 `npm ci --dry-run` で確認する。更新されたら「`package.json` と一緒にコミットが必要」とユーザーに伝える（git add はしない）

### 3. Lint とフォーマット

```bash
npm run lint
npm run format:check
```

- verify: どちらも exit code 0
- `format:check` が落ちた場合は `npm run format` で整形し、差分をユーザーに伝える

### 4. 型チェック

```bash
npm run typecheck
```

- verify: exit code 0
- 失敗時: エラー詳細を表示して**中断**する（`/dev:build-fix` を案内）

### 5. テスト

```bash
npm run test
```

- verify: unit / browser / storybook の全プロジェクトが全件パス
- 失敗時: 失敗したテストの詳細を表示して**中断**する
- Chromium を起動するので時間がかかることをユーザーに伝える

### 6. ビルド

```bash
npm run build
```

- verify: exit code 0
- 失敗時: エラー詳細を表示して**中断**する
- 出力のルート一覧で、`/[locale]` が静的生成（SSG）のまま保たれているか確認する。動的に変わっていたら警告する

### 7. E2E

```bash
npm run e2e
```

- verify: 全件パス（ポート 3100 で起動する。3000 の開発サーバーとはぶつからない）
- 失敗時: 失敗したテストと `playwright-report/` の場所を表示して**中断**する

### 8. main とのコンフリクト確認

```bash
git fetch origin main
git merge --no-commit --no-ff origin/main 2>&1 || true
git merge --abort 2>/dev/null || true
```

- verify: merge の出力に `CONFLICT` が含まれないこと
- コンフリクトがあれば該当ファイルを表示し、`git merge origin/main` での解決を勧める。結果は「要対応」とする
- `git merge --abort` は途中でエラーが出ても必ず実行し、元の状態に戻す
- `git stash` は使わない（worktree 間で共有されるため）

### 9. ドキュメント更新確認

```bash
git diff origin/main...HEAD --name-only
```

| 変更箇所                                          | 確認するドキュメント                                     |
| ------------------------------------------------- | -------------------------------------------------------- |
| `package.json` の scripts、ディレクトリ構成       | `CLAUDE.md`（主要コマンド・ディレクトリ構成）            |
| エラーコード・Server Action・セキュリティヘッダー | `CLAUDE.md`（エラー処理・セキュリティ）と設計書          |
| 文言を追加した organisms                          | `src/messages/*.json` の全ロケールに同じキーがあるか     |

- 実装が変わっているのに対応するドキュメントが差分にない場合は**警告**する（中断はしない）

### 10. 最終レポート

```markdown
## PR 作成前チェック結果

- [✓/✗] lockfile 整合性
- [✓/✗] Lint / フォーマット
- [✓/✗] 型チェック
- [✓/✗] テスト（unit / browser / storybook）
- [✓/✗] ビルド（/[locale] の SSG: 維持 / 変化あり）
- [✓/✗] E2E
- [✓/✗] コンフリクト確認
- [✓/⚠] ドキュメント更新確認

PR 作成可否: [可能 / 要修正]
```

すべてパスしたら PR の作成を案内する。

## 注意事項

- 型チェック・テスト・ビルド・E2E の失敗は必ず中断する
- `main` では実行しない
