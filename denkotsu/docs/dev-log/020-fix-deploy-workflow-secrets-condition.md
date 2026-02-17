# 020: CloudflareデプロイworkflowのSecrets条件を修正

**日付**: 2026-02-17

## やり取りの内容

GitHub Secrets 設定後に `Deploy to Cloudflare Pages` が失敗したため、  
workflow 実行前に落ちる原因を修正した。

## 原因

- `.github/workflows/deploy-pages.yml` の `jobs.deploy.if` で  
  `secrets.*` を直接参照していた
- そのためジョブ開始前に評価エラーとなり、job が作成されない失敗状態になっていた

## 実施内容

### 1. Secrets判定ロジックを step 化
- job-level `if` を削除
- `Check Cloudflare secrets` step を追加し、`GITHUB_OUTPUT` に `ready=true/false` を出力

### 2. デプロイ処理を条件実行に変更
- `Setup Node.js` / `npm ci` / `build` / `Deploy` を  
  `steps.secrets_check.outputs.ready == 'true'` 条件で実行
- Secrets 未設定時は `Skip deploy` step で明示ログを出し、安全にスキップ

## 変更ファイル

- `.github/workflows/deploy-pages.yml`
- `denkotsu/docs/dev-log/020-fix-deploy-workflow-secrets-condition.md`
