# 018: Cloudflare Pagesデプロイワークフローを追加（無料枠前提）

**日付**: 2026-02-17

## やり取りの内容

ユーザーの「有料プランなしで進める」方針に合わせ、Phase 1未完了項目のうち  
`Cloudflare Pages デプロイ + GitHub Actions CI/CD` を実装。

## 実施内容

### 1. デプロイworkflowを追加
- `.github/workflows/deploy-pages.yml` を新規作成
- トリガー:
  - `main` / `master` への push
  - pull request
- 処理:
  - `npm ci`
  - `npm run build`（静的出力 `denkotsu/out`）
  - `cloudflare/pages-action@v1` でPagesへデプロイ
    - push時: 本番（`branch: main`）
    - PR時: プレビュー（`branch: preview`）

### 2. Secrets未設定時の安全動作
- `if` 条件を入れ、以下3つのSecretsが未設定なら `deploy` ジョブをスキップ:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_PROJECT_NAME`

### 3. README更新
- `README.md` にデプロイ手順と必要Secretsを追記
- CI項目の表記を `check:data:ci` に更新

## 検証結果

- `npm run lint`: **OK**
- `npm run check:data:ci`: **OK**
- `npm run build`: **成功**

## 変更ファイル

- `.github/workflows/deploy-pages.yml`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/018-cloudflare-pages-deploy-workflow.md`
