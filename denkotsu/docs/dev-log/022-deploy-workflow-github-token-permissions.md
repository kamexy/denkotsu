# 022: Deploy workflow に GitHub Token 権限を追加

**日付**: 2026-02-17

## やり取りの内容

Cloudflare Pages へのデプロイ step が継続して失敗していたため、  
`cloudflare/pages-action` 実行時の GitHub Token 権限不足を疑い、workflow を修正した。

## 実施内容

### 1. workflow permissions を追加
- `.github/workflows/deploy-pages.yml` に以下を追加
  - `contents: read`
  - `deployments: write`
  - `pull-requests: write`

### 2. 目的
- `gitHubToken: ${{ secrets.GITHUB_TOKEN }}` を使う action が
  GitHub Deployment ステータス更新を行えるようにする

## 変更ファイル

- `.github/workflows/deploy-pages.yml`
- `denkotsu/docs/dev-log/022-deploy-workflow-github-token-permissions.md`
