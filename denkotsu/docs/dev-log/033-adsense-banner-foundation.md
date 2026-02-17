# 033 AdSense Banner Foundation

- 日付: 2026-02-17

## 依頼/背景
- スポンサーリンクに加えて、広告表示（AdSense）の実装方針を具体化したい。
- 学習体験を壊さないため、まずはセッション完了画面にバナー1枠のみ導入する。

## 実施内容
- 広告表示判定ロジックを `src/lib/ads.ts` に追加。
  - `NEXT_PUBLIC_ADSENSE_ENABLED` で広告機能をON/OFF。
  - セッション完了画面は、既定で `10問以上` 回答時のみ表示。
  - 開発時は `NEXT_PUBLIC_ADS_PREVIEW=1` でプレースホルダー表示可能。
- 汎用広告枠コンポーネント `src/components/ads/AdSlot.tsx` を追加。
  - AdSense ID/slotが設定済みなら `adsbygoogle` を描画。
  - 未設定時は開発プレビュー枠を表示してUI確認できる設計。
- セッション完了画面へバナー枠を追加。
  - `src/components/quiz/SessionComplete.tsx`
  - 学習中ではなく「ここまで」後のみ表示される導線に限定。
- ルートレイアウトのCSPを広告対応へ拡張し、AdSense scriptを条件付き読み込み。
  - `src/app/layout.tsx`
- `README.md` に広告用環境変数を追記。
- `public/ads.txt` のテンプレートを追加。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功
- ローカルUI確認（Playwrightスクリーンショット）
  - `.playwright-mcp/latest/session-complete-ad-desktop.png`
  - `.playwright-mcp/latest/session-complete-ad-mobile.png`

## 変更ファイル
- `denkotsu/src/lib/ads.ts`
- `denkotsu/src/components/ads/AdSlot.tsx`
- `denkotsu/src/components/quiz/SessionComplete.tsx`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/public/ads.txt`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/033-adsense-banner-foundation.md`
