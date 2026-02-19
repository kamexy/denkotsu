# 044 Ga Measurement Id Placeholder Redaction

- 日付: 2026-02-19

## 依頼/背景
- 実測定ID（`G-...`）が例示としてリポジトリに含まれていると、他ユーザーがそのまま流用する可能性がある。
- サンプル値はプレースホルダに統一し、誤用を防ぎたい。

## 実施内容
- `G-WD4GMKF6SR` の直接記載を全件プレースホルダへ置換。
  - README の設定例を `G-XXXXXXXXXX` に変更。
  - ランタイム警告メッセージの例を `G-XXXXXXXXXX` に変更。
  - 検証スクリプトのエラーメッセージ例を `G-XXXXXXXXXX` に変更。
  - 既存dev-logの記載も具体IDからプレースホルダ表現へ変更。

## 検証結果
- リポジトリ全体検索で `G-WD4GMKF6SR` の残存なし
- `npm run lint` 成功
- `npm run check:data` 成功

## 変更ファイル
- `denkotsu/README.md`
- `denkotsu/src/lib/analytics.ts`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/docs/dev-log/042-ga4-gtag-bootstrap-and-validation.md`
- `denkotsu/docs/dev-log/044-ga-measurement-id-placeholder-redaction.md`
