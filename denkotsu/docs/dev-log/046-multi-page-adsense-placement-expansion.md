# 046 Multi Page Adsense Placement Expansion

- 日付: 2026-02-19

## 依頼/背景
- AdSenseが「セッション完了画面のみ」の表示だと、広告表示回数が伸びにくい。
- 学習導線を妨げない範囲で、主要画面に広告表示枠を追加したい。

## 実施内容
- AdSenseバナーの表示箇所を3画面追加。
  - 要点画面: カテゴリタブ下
  - 成績画面: ステータスメッセージ下
  - 設定画面: データセクション下
- `AdSlot` に `placement` を追加し、広告イベント計測の配置識別を可能化。
- `ads.ts` を拡張し、ページ別スロット環境変数を追加。
  - `NEXT_PUBLIC_ADSENSE_SLOT_LEARN`
  - `NEXT_PUBLIC_ADSENSE_SLOT_STATS`
  - `NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS`
  - 未設定時は `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE` をフォールバックとして利用。
- `validate-monetization-env.mjs` を更新し、ページ別スロットの形式チェックを追加。
- deploy workflow にページ別スロット Secrets を追加。
- README に新規 Secrets / 環境変数 / 表示位置を追記。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功
- `npm run check:monetization` 成功

## 変更ファイル
- `.github/workflows/deploy-pages.yml`
- `denkotsu/src/lib/ads.ts`
- `denkotsu/src/lib/telemetry.ts`
- `denkotsu/src/components/ads/AdSlot.tsx`
- `denkotsu/src/components/quiz/SessionComplete.tsx`
- `denkotsu/src/app/learn/page.tsx`
- `denkotsu/src/app/stats/page.tsx`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/046-multi-page-adsense-placement-expansion.md`
