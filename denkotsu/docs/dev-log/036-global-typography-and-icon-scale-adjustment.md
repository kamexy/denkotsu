# 036 Global Typography And Icon Scale Adjustment

- 日付: 2026-02-18

## 依頼/背景
- 下部ナビ以外のフォントサイズとアイコンを、さらに1段階大きくしたい。
- 高密度な画面（要点・設定・クイズ）でも読みやすさを優先したい。

## 実施内容
- 主要画面と共通コンポーネントの文字サイズを1段階拡大。
  - `text-xs → text-sm`
  - `text-sm → text-base`
  - `text-base → text-lg`（必要箇所）
  - 固定px指定も段階的に調整（`10→11`, `11→12`, `15→16`）
- アイコン系の視認性を改善。
  - クイズ選択肢の番号バッジ: `h-7 w-7 → h-8 w-8`
  - 正誤記号: `text-lg → text-xl`
  - 画像ライトボックス閉じるボタン: `w-10 h-10 text-xl → w-11 h-11 text-2xl`
  - 設定トグル: `w-11 h-6 / knob w-5 h-5 → w-12 h-7 / knob w-6 h-6`
  - ローディングスピナー: `w-8 h-8 → w-9 h-9`
- 下部ナビ（`BottomNav`）は今回変更対象から除外。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功
- ローカルUI確認（Playwrightスクリーンショット）
  - `.playwright-mcp/latest/ui-scale-v3-home-mobile.png`
  - `.playwright-mcp/latest/ui-scale-v3-learn-mobile-viewport.png`
  - `.playwright-mcp/latest/ui-scale-v3-stats-mobile.png`
  - `.playwright-mcp/latest/ui-scale-v3-settings-mobile-viewport.png`
  - `.playwright-mcp/latest/ui-scale-v3-settings-desktop-viewport.png`

## 変更ファイル
- `denkotsu/src/app/page.tsx`
- `denkotsu/src/app/learn/page.tsx`
- `denkotsu/src/app/stats/page.tsx`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/src/components/stats/CategoryBar.tsx`
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/src/components/quiz/OptionButton.tsx`
- `denkotsu/src/components/quiz/QuizResult.tsx`
- `denkotsu/src/components/quiz/SessionComplete.tsx`
- `denkotsu/src/components/monetization/RecommendedToolsSection.tsx`
- `denkotsu/src/components/ads/AdSlot.tsx`
- `denkotsu/src/components/ui/ImageLightbox.tsx`
- `denkotsu/docs/dev-log/036-global-typography-and-icon-scale-adjustment.md`
