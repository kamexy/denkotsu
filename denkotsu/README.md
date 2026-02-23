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

# CI用（既存警告ベースラインとの差分を厳格チェック）
npm run check:data:ci

# ベースライン更新（警告を整理した後に実行）
npm run check:data:update-baseline

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
│   ├── validate-content.mjs                  # データ整合チェック
│   └── validate-content-warning-baseline.json # CI警告ベースライン
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
- `NEXT_PUBLIC_MONETIZATION_ENABLED`（収益導線の表示を切り替える場合）
- `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`（Amazonアソシエイトを利用する場合）
- `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENABLED`（収益導線計測を切り替える場合）
- `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT`（外部計測エンドポイントを使う場合）
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`（GA4計測を有効にする場合）
- `NEXT_PUBLIC_ADSENSE_ENABLED`（AdSenseを有効にする場合）
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`（AdSenseを有効にする場合）
- `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE`（AdSenseを有効にする場合）
- `NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK`（解説直下で別スロットを使う場合）
- `NEXT_PUBLIC_ADSENSE_SLOT_LEARN`（要点画面で別スロットを使う場合）
- `NEXT_PUBLIC_ADSENSE_SLOT_STATS`（成績画面で別スロットを使う場合）
- `NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS`（設定画面で別スロットを使う場合）
- `NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS`（広告表示の閾値を変更する場合）
- `NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS`（解説直下広告の最小表示回答数を変更する場合）
- `NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL`（解説直下広告の表示間隔を変更する場合）
- `NEXT_PUBLIC_ADS_PREVIEW`（広告プレビューを使う場合）

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
  - 形式は `xxxxx-22`（例: `kamexy-22`）
  - 未設定時は `kamexy-22` を使用します
  - 設定すると Amazon URL の `tag` パラメータを上書きします
- `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENABLED`
  - `1`（デフォルト）: 収益導線クリック計測を有効化
  - `0`: 収益導線クリック計測を無効化
- `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT`
  - クリック計測イベントの送信先（任意、http(s) URL）
  - 例: `https://example.com/collect`
  - 未設定時は外部送信せず、既知の分析ツール（`gtag` / `plausible` / `sa_event`）があればそちらへ送信
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - GA4 の測定ID（任意）
  - 形式: `G-XXXXXXX`
  - 例: `G-XXXXXXXXXX`
  - 設定時は `gtag.js` を自動読込し、収益導線イベントを GA4 に送信

### AdSense（バナー広告）基盤

セッション完了画面に、無料ユーザー向けのバナー広告枠を表示できます。

- `NEXT_PUBLIC_ADSENSE_ENABLED`
  - `1`: 広告表示を有効化
  - `0`（デフォルト）: 広告表示を無効化
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
  - 例: `ca-pub-xxxxxxxxxxxxxxxx`
- `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE`
  - セッション完了画面の広告スロットID（数字のみ）
- `NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK`
  - 解説直下の広告スロットID（数字のみ、未設定時は `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE` を利用）
- `NEXT_PUBLIC_ADSENSE_SLOT_LEARN`
  - 要点画面の広告スロットID（数字のみ、未設定時は `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE` を利用）
- `NEXT_PUBLIC_ADSENSE_SLOT_STATS`
  - 成績画面の広告スロットID（数字のみ、未設定時は `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE` を利用）
- `NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS`
  - 設定画面の広告スロットID（数字のみ、未設定時は `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE` を利用）
- `NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS`
  - 広告表示を開始する最小回答数（デフォルト `10`）
- `NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS`
  - 解説直下広告の表示を開始する最小回答数（デフォルト `3`）
- `NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL`
  - 解説直下広告の表示間隔（`4` なら 4問ごと、デフォルト `4`）
- `NEXT_PUBLIC_ADS_PREVIEW`
  - `1` のとき、AdSense ID未設定でも広告プレースホルダーを表示（UI確認用）
- `public/ads.txt`
  - AdSense のパブリッシャーID行を配置
  - 例: `google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0`

広告表示位置:

- クイズのセッション完了画面
- クイズの解説直下（一定間隔）
- 要点画面（カテゴリタブ下）
- 成績画面（サマリメッセージ下）
- 設定画面（データセクション下）

### 収益化設定チェック

ローカル/CIで、収益化用の環境変数の形式を検証できます。

```bash
cd denkotsu
npm run check:monetization
```

- `NEXT_PUBLIC_ADSENSE_ENABLED=1` の場合は、AdSenseの `client_id` / `slot` の形式不備をエラーにします。
- `NEXT_PUBLIC_MONETIZATION_ENABLED!=0` かつ `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` 設定時は、`xxxxx-22` 形式を検証します。
- `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT` を設定する場合は、http(s) URL 形式を検証します。
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` を設定する場合は、`G-XXXXXXX` 形式を検証します。

## 運用ルール

- リポジトリ共通ルールはルートの `AGENTS.md` を参照してください。
- 変更時は `docs/dev-log/` に履歴を追記し、適切な粒度でコミットします。
