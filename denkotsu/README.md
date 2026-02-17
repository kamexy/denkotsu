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

## デプロイ（Cloudflare Pages / 無料枠）

- デプロイ workflow: `.github/workflows/deploy-pages.yml`
- `main` / `master` への push: 本番デプロイ
- Pull Request: プレビューデプロイ

### 必要な GitHub Secrets

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PROJECT_NAME`

Secrets が未設定の場合、`deploy` ジョブ内でデプロイ手順のみ自動スキップされます。

## 運用ルール

- リポジトリ共通ルールはルートの `AGENTS.md` を参照してください。
- 変更時は `docs/dev-log/` に履歴を追記し、適切な粒度でコミットします。
