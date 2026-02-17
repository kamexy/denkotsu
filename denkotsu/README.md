# デンコツ（第二種電気工事士 学習アプリ）

第二種電気工事士向けの学習アプリです。  
クイズ・要点チェック・成績可視化を中心に、PWA とオフライン学習に対応しています。

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Dexie.js (IndexedDB)

## セットアップ

```bash
cd denkotsu
npm ci
```

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# lint
npm run lint

# 問題データ・画像整合チェック
npm run check:data

# ビルド（安定重視: webpack）
npm run build

# 参考: Turbopackビルド
npm run build:turbopack

# 一括チェック（lint + data check + build）
npm run check

# リリース（バージョン更新）
npm run release:patch
npm run release:minor
npm run release:major
```

## ディレクトリ（主要）

```text
denkotsu/
├── src/
│   ├── app/                 # 画面
│   ├── components/          # UIコンポーネント
│   ├── data/                # questions / key-points JSON
│   ├── hooks/               # useQuiz / usePassPower
│   ├── lib/                 # quiz-engine / pass-power / db
│   └── types/               # 型定義
├── public/
│   ├── images/              # 図記号・回路図・器具画像
│   ├── manifest.json
│   └── sw.js
├── scripts/
│   └── validate-content.mjs # データ整合チェック
└── docs/dev-log/            # 開発ログ
```

## 品質ゲート

- CI（`.github/workflows/ci.yml`）で以下を実行します。
  - `npm run lint`
  - `npm run check:data:ci`
  - `npm run build`

## バージョニング運用（SemVer）

- バージョンの正本は `denkotsu/package.json` の `version`
- コミット種別に応じて更新
  - `fix:` → patch（`0.1.0` → `0.1.1`）
  - `feat:` → minor（`0.1.0` → `0.2.0`）
  - `feat!:` / `BREAKING CHANGE:` → major（`0.1.0` → `1.0.0`）
- `docs:` / `chore:` / `ci:` / `test:` は原則バージョン更新なし

### リリース手順

1. `denkotsu` でリリースコマンドを実行（`release:patch|minor|major`）
2. 生成されたコミット `chore(release): vX.Y.Z` とタグを push

```bash
cd denkotsu
npm run release:patch
git push origin main --follow-tags
```

## デプロイ（Cloudflare Pages / 無料枠）

- デプロイ workflow: `.github/workflows/deploy-pages.yml`
- `main` / `master` への push: 本番デプロイ
- Pull Request: プレビューデプロイ

### 必要な GitHub Secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PROJECT_NAME`
- `NEXT_PUBLIC_SYNC_API_BASE`（クラウド同期機能を有効にする場合）

Secrets が未設定の場合、`deploy` ジョブ内でデプロイ手順のみ自動スキップされます。

## クラウド同期（Phase 2 / D1 + Workers）

このリポジトリには、学習データ同期用の Worker 雛形を同梱しています。

### 1. D1 データベースを作成

```bash
npx wrangler d1 create denkotsu_sync
```

出力される `database_id` を `cloudflare/sync-worker/wrangler.jsonc` の  
`REPLACE_WITH_D1_DATABASE_ID` に設定してください。

### 2. マイグレーション適用

```bash
cd cloudflare/sync-worker
npx wrangler d1 migrations apply denkotsu_sync --remote
```

### 3. 同期 Worker をデプロイ

```bash
npx wrangler deploy
```

### 4. フロントへ同期API URLを設定

`denkotsu` をビルド/デプロイする環境に、次の公開変数を設定します。

- `NEXT_PUBLIC_SYNC_API_BASE`  
  例: `https://denkotsu-sync.<your-subdomain>.workers.dev`

設定後、設定画面の `クラウド同期（β）` から以下を実行できます。

- 同期コードの保存
- クラウドへ保存（push）
- クラウドから復元（pull）
- 強い同期コードの自動生成

### 同期コードの要件（β）

- 12〜64文字
- 使用可能文字: 英数字 / `-` / `_`
- 英字と数字を両方含む
- `123456` など推測されやすい文字列は不可

## 収益化導線（初期）

設定画面に「試験対策グッズ（スポンサーリンク）」を表示できます。

- `NEXT_PUBLIC_MONETIZATION_ENABLED`
  - `1`（デフォルト）: 表示する
  - `0`: 非表示にする
- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`
  - Amazonアソシエイトタグ（任意）
  - 未設定時は `kamexy-22` を使用します
  - 設定すると Amazon URL の `tag` パラメータを上書きします

### AdSense（バナー広告）基盤

セッション完了画面に、無料ユーザー向けのバナー広告枠を表示できます。

- `NEXT_PUBLIC_ADSENSE_ENABLED`
  - `1`: 広告表示を有効化
  - `0`（デフォルト）: 広告表示を無効化
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
  - 例: `ca-pub-xxxxxxxxxxxxxxxx`
- `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE`
  - セッション完了画面の広告スロットID
- `NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS`
  - 広告表示を開始する最小回答数（デフォルト `10`）
- `NEXT_PUBLIC_ADS_PREVIEW`
  - `1` のとき、AdSense ID未設定でも広告プレースホルダーを表示（UI確認用）

## 運用ルール

- リポジトリ共通ルールはルートの `AGENTS.md` を参照してください。
- 変更時は `docs/dev-log/` に履歴を追記し、適切な粒度でコミットします。
