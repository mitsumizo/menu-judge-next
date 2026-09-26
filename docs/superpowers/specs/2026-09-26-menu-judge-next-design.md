# Menu Judge Next — 設計書

- 作成日: 2026-09-26
- ステータス: レビュー待ち
- 移植元: `menu-judge`（Flask + Jinja2 + HTMX + Alpine.js）

## 1. 目的と前提

### 目的
- **Next.js（App Router）を学ぶ**ために、既存の Flask 製 Menu Judge を Next.js 単体で作り直す
- 最終的に Vercel に公開し、ポートフォリオとして見せられる状態にする

### 完成の定義
- Flask 版と同等の機能（アップロード／カメラ撮影 → Claude で解析 → 料理カード表示、APIキー入力、英日切り替え、エラー表示）が Next.js 版で動作し、Vercel 本番環境に公開されていること
- 各フェーズ終了時点で Vercel にデプロイされ、動作していること

### 前提・制約
- Flask 版（`menu-judge` リポジトリ）はそのまま残し、変更しない
- 新リポジトリ: `~/Develop/my-project/menu-judge-next`（GitHub: `mitsumizo/menu-judge-next`）
- APIキーはサーバーに保存しない（ユーザーがブラウザで入力し localStorage に保存する方式を踏襲）

### スコープ外
- Web 検索連携、ユーザー認証、履歴・お気に入り、好みに基づく推薦（Flask 版の Phase 2/3 構想）
- OpenAI / Gemini 対応（Flask 版でも未実装）
- レート制限（理由は §7）
- サンプルメニュー集などの SSR 用追加ページ（検討の上で見送り。§3 参照）

## 2. 技術スタック

| 領域 | 採用技術 | 備考 |
|---|---|---|
| フレームワーク | Next.js（着手時点の最新安定版）/ App Router | |
| 言語 | TypeScript（strict） | |
| スタイリング | Tailwind CSS | Flask 版（`tailwind.config.js`）のカラーパレットをトークン化 |
| 多言語 | next-intl | `/en`・`/ja` のロケールルーティング |
| AI | `@anthropic-ai/sdk` / モデル `claude-sonnet-5` | サーバー側のみで使用 |
| バリデーション | zod | Claude の応答 JSON を検証 |
| UIカタログ | Storybook（`@storybook/nextjs-vite`） | |
| テスト | Vitest（ロジック）、Storybook + Vitest 連携（コンポーネント）、Playwright（E2E） | §8 |
| Lint/Format | ESLint、Prettier | |
| CI | GitHub Actions | lint・型チェック・テスト・ビルド |
| ホスティング | Vercel | PR ごとのプレビュー環境を利用 |

カラーパレット（Flask 版の `tailwind.config.js` 実装値から継承。CLAUDE.md 記載の値とは異なる）:

```
Primary:    #6366F1 (light #818CF8 / dark #4F46E5)
Secondary:  #EC4899   Accent:  #8B5CF6
Background: #0B0F19   Surface: #111827
Text:       #F9FAFB (secondary #9CA3AF)
```

## 3. 描画方式（SSG / SSR / CSR）

App Router では描画方式を直接指定するのではなく、書き方によって決まる。

| 呼び方 | App Router での実体 | 条件 |
|---|---|---|
| SSG | Static Rendering | リクエスト固有のデータ（cookies / headers / searchParams）を使わない。`generateStaticParams` で事前生成 |
| SSR | Dynamic Rendering | リクエスト固有のデータを読む |
| ISR | Static + `revalidate` | 一定間隔で再生成 |
| CSR | Client Components | `"use client"` でブラウザ側で状態を持って描画 |

本アプリでの適用:

| 対象 | 方式 | 理由 |
|---|---|---|
| `/[locale]`（メイン画面の外枠） | **SSG** | ロケールごとに `generateStaticParams` で `/en`・`/ja` を事前生成 |
| アップロード、APIキー入力、解析結果表示 | **CSR** | localStorage とユーザー操作に依存するため |
| 解析処理 | Server Action | サーバーで関数を実行する仕組みであり、**SSR ではない** |

- SSR を使う必然性のある画面は本アプリに存在しないため、SSR は扱わない
- Phase 4 でビルド出力（ルートごとの Static / Dynamic 表示）を確認し、上表どおりであることを README に記録する

## 4. アーキテクチャ

### データの流れ

1. ブラウザで画像を選択または撮影する
2. `lib/image.ts` で長辺 1568px の JPEG に縮小する（Vercel のリクエスト上限 4.5MB 対策、Claude の推奨サイズに合わせてトークン代も削減）
3. FormData（画像・APIキー・言語）を Server Action `analyzeMenu()` に渡す
4. サーバー側で `lib/claude.ts` が Claude を呼び、応答 JSON を zod で検証して `Dish[]` に変換する
5. クライアントは `useActionState` で結果を受け取り、カード一覧を描画する

### ディレクトリ構成

```
menu-judge-next/
├── src/
│   ├── app/[locale]/
│   │   ├── layout.tsx          # 共通レイアウト、ロケール設定
│   │   ├── page.tsx            # メイン画面（pages 層）
│   │   ├── actions.ts          # "use server" analyzeMenu()
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── lib/
│   │   ├── dish.ts             # Dish の zod スキーマと型
│   │   ├── prompt.ts           # ロケール別プロンプト生成
│   │   ├── claude.ts           # Claude 呼び出しと応答解析（server-only）
│   │   ├── analyze-result.ts   # Server Action の戻り値型とエラーコード
│   │   └── image.ts            # ブラウザ側の画像縮小
│   ├── i18n/                   # next-intl 設定
│   └── messages/
│       ├── en.json
│       └── ja.json
├── .storybook/
├── e2e/                        # Playwright
└── docs/
```

### Dish モデル（Flask 版から移植）

| フィールド | 型 | 制約 |
|---|---|---|
| `original_name` | string | 必須 |
| `translated_name` | string | 必須 |
| `description` | string | 必須 |
| `spiciness` | number | 整数 1〜5 |
| `sweetness` | number | 整数 1〜5 |
| `ingredients` | string[] | 省略時は空配列 |
| `allergens` | string[] | 省略時は空配列 |
| `category` | enum | `appetizer` / `main` / `dessert` / `beverage` / `other`。想定外の値・欠落時は `other` |
| `price_range` | enum \| null | `$` / `$$` / `$$$` / `$$$$`。判別不能・想定外の値は `null` |

- Claude 応答の形式は Flask 版と同じ `{ "dishes": [...] }`。コードブロック（```json）で囲まれていても解析できること

## 5. コンポーネント設計（Atomic Design）

| 階層 | コンポーネント |
|---|---|
| atoms | `Button`, `Tag`, `Badge`, `LevelMeter`, `Spinner`, `TextInput` |
| molecules | `LevelRow`, `TagList`, `ApiKeyField`, `LanguageSwitcher`, `Toast` |
| organisms | `DishCard`, `DishList`, `UploadZone`, `ApiKeyDialog`, `Header`, `ErrorPanel` |
| templates | `AnalyzeTemplate` |
| pages | `app/[locale]/page.tsx`（Next.js のルートが担う） |

### 階層ごとのルール
- **atoms / molecules**: 表示専用。テキストは props で受け取り、翻訳・通信・localStorage に触れない。Server / Client のどちらからも使える
- **organisms**: 翻訳（`useTranslations`）や状態を持ってよい。`"use client"` はこの階層から付ける
- **templates**: 配置のみを決め、中身は `children` や props（slot）で受け取る
- **pages**: Server Action を呼ぶのはこの層のみ。下位へは関数を props で渡す（Storybook ではモック関数を渡す）

### Storybook
- story はコンポーネントと同じディレクトリに置く（例: `atoms/Button/Button.stories.tsx`）
- 共通 decorator で `NextIntlClientProvider`（en / ja 切り替え）とダークモード配色を適用する

## 6. エラー処理

Server Action は例外を投げず、判別可能な共用体型を返す（本番環境では例外メッセージが伏せられるため）。

```ts
type AnalyzeResult =
  | { ok: true; dishes: Dish[] }
  | { ok: false; code: AnalyzeErrorCode };
```

| code | 発生条件 | 判定場所 |
|---|---|---|
| `NO_API_KEY` | APIキーが空 | ブラウザ・サーバー |
| `INVALID_FILE` | JPEG / PNG / WebP 以外、10MB 超、読み込めない画像 | ブラウザ・サーバー |
| `INVALID_API_KEY` | Anthropic が 401 を返した | サーバー |
| `RATE_LIMITED` | Anthropic が 429 を返した | サーバー |
| `NOT_A_MENU` | 有効な料理が 1 件も得られなかった | サーバー |
| `PARSE_ERROR` | 応答が JSON として読めない、または `dishes` キーがない | サーバー |
| `UNKNOWN` | 上記以外 | サーバー |

- 料理 1 件ごとの検証に失敗した場合は**その料理だけを除外**し、残りを返す（Flask 版の挙動を踏襲）。全件除外された場合は `NOT_A_MENU`
- 画面側は `code` に対応する翻訳済み文言を `ErrorPanel` または `Toast` で表示する
- 予期しない例外は `error.tsx` で受け止める

## 7. セキュリティ

- `lib/claude.ts` の先頭に `import "server-only"` を置き、クライアントバンドルへの混入を防ぐ
- APIキーはログ出力・永続化しない。ログには `code` と処理時間のみ残す
- Server Action の `bodySizeLimit` は縮小後の画像に合わせて 4MB に設定する
- `next.config` でセキュリティ関連の HTTP ヘッダー（CSP など）を付与する
- レート制限は実装しない。APIキーはユーザー自身のものであり、過剰な利用の負担は本人に返るため
- 本番環境は Vercel により HTTPS で配信される

## 8. テスト方針

| 対象 | ツール | 内容 |
|---|---|---|
| `lib/`（dish, prompt, claude, image） | Vitest | TDD（Red → Green → Refactor）。正常系・異常系・境界値を網羅 |
| コンポーネント | Storybook + Vitest 連携 | story の描画テストと `play` 関数による操作テスト |
| 画面全体 | Playwright | 主要フロー（アップロード → 結果表示、エラー表示、言語切り替え） |

- `lib/claude.ts` のテストでは Anthropic SDK クライアントを差し替えて応答を模擬する（モックは最小限）
- E2E では SDK の `baseURL` を環境変数で差し替え、ローカルのモックサーバーに向ける。本番コードにテスト用の分岐は入れない
- CI（GitHub Actions）で lint・型チェック・Vitest（ロジック＋Storybook）・ビルドを実行する

## 9. フェーズ計画

各フェーズの終わりに Vercel へデプロイする。

### Phase 0: 土台
- `create-next-app`（TypeScript strict、Tailwind、ESLint）、Prettier
- カラーパレットを Tailwind のトークンとして定義
- Vitest、Storybook（Vitest 連携）、Playwright の導入
- GitHub Actions による CI
- Vercel 連携とプレビュー環境の確認

### Phase 1: MVP（アップロード → 解析 → カード表示）
- `lib/dish.ts`、`lib/prompt.ts`、`lib/claude.ts` を TDD で実装
- Server Action `analyzeMenu()`
- atoms → molecules → `DishCard`・`DishList` を story とともに実装
- 画像はファイル選択のみ（縮小は Phase 2 のため、この時点では 3.75MB 超の画像は `INVALID_FILE` として扱う。Anthropic の画像上限 5MB は base64 化後のサイズで判定されるため、元画像はその 3/4 が上限）
- APIキーは画面上の簡易入力欄で受け付け、localStorage に保存
- next-intl を導入し、英語メッセージのみ用意

### Phase 2: 使い勝手の向上
- ドラッグ&ドロップ、カメラ撮影（`<input capture="environment">`、Flask 版と同方式）
- `lib/image.ts` によるブラウザ側縮小
- スケルトン表示、`Toast`、`ErrorPanel`（§6 の全エラーコードに対応）

### Phase 3: APIキー画面と日本語対応
- 初回アクセス時の `ApiKeyDialog`
- `ja.json`、`LanguageSwitcher`、ロケール別プロンプト

### Phase 4: 仕上げ
- Playwright による E2E
- ビルド出力で描画方式（§3）を確認し README に記録
- README 整備、本番公開
