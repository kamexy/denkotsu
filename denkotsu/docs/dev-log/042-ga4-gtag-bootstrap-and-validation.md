# 042 Ga4 Gtag Bootstrap And Validation

- 日付: 2026-02-19

## 依頼/背景
- GA4 の測定ID（`G-XXXXXXXXXX` 形式）を取得できたため、アプリ側で `gtag` 連携を有効化したい。
- 既存の収益導線イベント計測を GA4 に送れる状態を作りたい。

## 実施内容
- GA4 設定取得用のライブラリを追加。
  - `src/lib/analytics.ts`
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` の形式検証（`G-XXXX...`）と警告取得を実装。
- ルートレイアウトで GA4 スクリプトを条件付き読み込み。
  - `src/app/layout.tsx`
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` が正しい場合のみ `gtag.js` を注入。
  - `window.gtag` 初期化と `gtag('config', measurementId)` を追加。
  - CSP に `googletagmanager.com` / `google-analytics.com` 系の送信先を追加。
- 環境変数検証スクリプトを強化。
  - `scripts/validate-monetization-env.mjs`
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` 設定時の形式チェックを追加。
- README を更新し、GA4 用環境変数の設定ルールを追記。
- `feat` ルールに従い、アプリバージョンを `0.4.0` から `0.5.0` に更新。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run check:monetization` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/README.md`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/src/lib/analytics.ts`
- `denkotsu/docs/dev-log/042-ga4-gtag-bootstrap-and-validation.md`
