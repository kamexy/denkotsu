# 043 Deploy Workflow Ga Env Injection

- 日付: 2026-02-19

## 依頼/背景
- GA4測定IDを取得済みだが、デプロイ時ビルドへ環境変数が渡らないと本番反映されない。
- 現行の Cloudflare Pages deploy workflow は `NEXT_PUBLIC_GA_MEASUREMENT_ID` を未注入だった。

## 実施内容
- `deploy-pages.yml` の job env に `NEXT_PUBLIC_GA_MEASUREMENT_ID` を追加。
- README の「必要な GitHub Secrets」に `NEXT_PUBLIC_GA_MEASUREMENT_ID` を追記。
- `fix` ルールに従い、アプリバージョンを `0.5.0` から `0.5.1` に更新。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功

## 変更ファイル
- `.github/workflows/deploy-pages.yml`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/043-deploy-workflow-ga-env-injection.md`
