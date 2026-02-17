# 032 Monetization Affiliate Foundation

- 日付: 2026-02-17

## 依頼/背景
- 「ログインなし方針」を維持したまま、早めに広告などのマネタイズ導線を着手したい。
- まずは実装コストと運用負荷が低い導線から段階的に入れたい。

## 実施内容
- 設定画面に「試験対策グッズ（スポンサーリンク）」セクションを追加。
  - 収益化導線を学習導線の邪魔になりにくい設定画面下部へ配置。
  - 各リンクは `rel=\"sponsored\"` を付与し、外部遷移で開く実装に統一。
- 商品リンクデータを `src/data/recommended-tools.json` として分離。
  - コード変更なしでリンク差し替えしやすい構成に変更。
- 収益化用ヘルパー `src/lib/monetization.ts` を追加。
  - `NEXT_PUBLIC_MONETIZATION_ENABLED=0` で導線を一括非表示化。
  - `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` を設定すると Amazon URL に `tag` を自動付与。
- `README.md` に収益化導線の環境変数運用を追記。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功
- ローカルUI確認（Playwrightスクリーンショット）
  - `.playwright-mcp/latest/settings-monetization-desktop.png`
  - `.playwright-mcp/latest/settings-monetization-mobile.png`

## 変更ファイル
- `denkotsu/src/data/recommended-tools.json`
- `denkotsu/src/lib/monetization.ts`
- `denkotsu/src/components/monetization/RecommendedToolsSection.tsx`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/032-monetization-affiliate-foundation.md`
