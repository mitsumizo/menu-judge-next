---
description: Architecture violation check - inspects Atomic Design layer rules, Server/Client boundaries, and forbidden imports. Use before a PR or after a structural change.
---

# アーキテクチャ違反チェック

CLAUDE.md の「ディレクトリ構成と Atomic Design」「セキュリティ」のルールに沿っているかを検査する。

## 1. 対象範囲の決定

- 引数なし: `src/` 全体
- ブランチ作業中で差分だけ見たい場合: `git diff --name-only origin/main...HEAD` の変更ファイルに限定する

## 2. チェック項目

以下を順に実行する。grep はコメントや文字列にも反応するので、ヒットしたら必ずファイルを Read して誤検知でないか確かめる。

### CRITICAL（1 件でも不合格）

1. **下の階層が上の階層を import していない**（atoms → molecules → organisms → templates → pages の順にしか依存しない）

   ```bash
   grep -rnE "components/(molecules|organisms|templates)/" src/components/atoms/
   grep -rnE "components/(organisms|templates)/" src/components/molecules/
   grep -rnE "components/templates/" src/components/organisms/
   ```

2. **atoms / molecules が翻訳・通信・localStorage に触れていない**

   ```bash
   grep -rnE "next-intl|useTranslations|getTranslations|localStorage|fetch\(|/actions\"|@/lib/(claude|api-key-storage)" src/components/atoms/ src/components/molecules/
   ```

3. **Server Action（`app/[locale]/actions.ts`）を import しているのは pages 層だけ**

   ```bash
   grep -rn "actions\"" src/ --include="*.ts" --include="*.tsx" | grep -v "^src/app/"
   ```

4. **`src/lib/claude.ts` の先頭に `import "server-only"` があり、Client Component から import されていない**

   ```bash
   head -3 src/lib/claude.ts
   grep -rln "@/lib/claude\"" src/ | xargs grep -l "\"use client\""
   ```

5. **本番コードが `src/testing/` を import していない**（stories とテストは可）

   ```bash
   grep -rn "@/testing/" src/ --include="*.ts" --include="*.tsx" | grep -vE "\.(test|browser\.test|stories)\.tsx?:"
   ```

6. **APIキーをログに出していない**

   ```bash
   grep -rnE "console\.(log|info|warn|error).*([aA]pi[kK]ey|apiKey|api_key)" src/
   ```

### WARNING（件数を報告し、判断はユーザーに委ねる）

7. **atoms / molecules の `"use client"`**: 見た目のための局所的な状態（`useState` / `useEffect` / `useId`）だけなら許容。それ以外の理由なら organisms へ移すべき

   ```bash
   grep -rln "\"use client\"" src/components/atoms/ src/components/molecules/
   ```

8. **templates が中身を直接描画していない**: templates は配置のみ。organisms を直接 import していたら、children / スロット props で受け取る形にできないか確認する

   ```bash
   grep -rn "components/organisms/" src/components/templates/
   ```

9. **ファイル配置と命名**: 各コンポーネントが `階層/Xxx/Xxx.tsx` と `Xxx.stories.tsx` の組になっているか

   ```bash
   for d in src/components/*/*/; do n=$(basename "$d"); [ -f "$d$n.stories.tsx" ] || echo "stories なし: $d"; done
   ```

10. **ハードコードされた色**: デザイントークン（`bg-primary` など）を使わず `#xxxxxx` や `bg-[#...]` を書いていないか

    ```bash
    grep -rnE "#[0-9a-fA-F]{6}\b" src/components/ --include="*.tsx" | grep -v "\.stories\.tsx"
    ```

## 3. 報告

確認済みの違反だけを次の形式で報告し、違反ごとに具体的な直し方を添える。

```markdown
## アーキテクチャチェック結果

- 対象: src/ 全体 / 差分 N ファイル
- CRITICAL: N 件 / WARNING: N 件

### 違反詳細
[CRITICAL] #2 src/components/molecules/Foo/Foo.tsx:3 — useTranslations を使用 → 文言を props で受け取り、翻訳は organisms で行う
[WARNING] #7 ...

総合評価: 合格（0 件） / 警告（WARNING のみ） / 不合格（CRITICAL あり）
```

- 自動修正はユーザーの指示があった場合のみ行う
- 誤検知の可能性があるものはその旨を明記する
