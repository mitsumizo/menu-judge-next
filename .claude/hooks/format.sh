#!/usr/bin/env bash
# PostToolUse hook: Claude が編集したファイルに ESLint（--fix）と Prettier をかける。
# ESLint のエラーが残った場合は exit 2 で内容を Claude に返し、修正させる。
set -uo pipefail

file=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path??"")}catch{}})')
[ -n "$file" ] && [ -f "$file" ] || exit 0

# ファイルが属するチェックアウト（worktree を含む）のツールを使う
root=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null) || exit 0
bin="$root/node_modules/.bin"
[ -x "$bin/prettier" ] || exit 0
cd "$root" || exit 0

case "$file" in
  */node_modules/*) exit 0 ;;
  *.js | *.jsx | *.ts | *.tsx | *.mjs | *.cjs)
    if ! lint_output=$("$bin/eslint" --fix --no-warn-ignored "$file" 2>&1); then
      "$bin/prettier" --write --log-level warn "$file" >/dev/null 2>&1
      echo "ESLint errors remain in $file:" >&2
      echo "$lint_output" >&2
      exit 2
    fi
    ;;
esac

"$bin/prettier" --write --ignore-unknown --log-level warn "$file" >/dev/null 2>&1
exit 0
