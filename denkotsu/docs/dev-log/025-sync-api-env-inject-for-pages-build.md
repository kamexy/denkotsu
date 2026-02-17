# 025: 同期API環境変数をPagesビルドへ注入

**日付**: 2026-02-17

## やり取りの内容

ユーザーが `NEXT_PUBLIC_SYNC_API_BASE` を GitHub Secrets に設定したため、  
Pages デプロイ時のビルドで当該値を参照できるように修正した。

## 実施内容

### 1. Deploy workflow を更新
- `.github/workflows/deploy-pages.yml` の `deploy` job `env` に
  `NEXT_PUBLIC_SYNC_API_BASE: ${{ secrets.NEXT_PUBLIC_SYNC_API_BASE }}` を追加
- これにより `npm run build` 実行時に `NEXT_PUBLIC_SYNC_API_BASE` が注入され、
  同期UIが「未設定」表示にならず Worker API を利用可能にした

### 2. README 更新
- `denkotsu/README.md` の「必要な GitHub Secrets」に
  `NEXT_PUBLIC_SYNC_API_BASE`（クラウド同期利用時）を追記

### 3. 同期Worker設定の反映
- `cloudflare/sync-worker/wrangler.jsonc` の `database_id` を実値に更新

## 変更ファイル

- `.github/workflows/deploy-pages.yml`
- `denkotsu/README.md`
- `cloudflare/sync-worker/wrangler.jsonc`
- `denkotsu/docs/dev-log/025-sync-api-env-inject-for-pages-build.md`
