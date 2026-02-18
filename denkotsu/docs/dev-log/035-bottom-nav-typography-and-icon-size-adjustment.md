# 035 Bottom Nav Typography And Icon Size Adjustment

- 日付: 2026-02-17

## 依頼/背景
- 下部ナビ（クイズ / 要点 / 成績 / 設定）の文字とアイコンが小さく、見づらい。
- フォントとアイコンを段階的に拡大して、視認性を改善したい。

## 実施内容
- `src/components/layout/BottomNav.tsx` のサイズを調整。
  - ラベル文字: `11px → 12px → 13px`
  - アイコン: `16px → 20px → 24px`
- デスクトップ/モバイルのスクリーンショットで、レイアウト崩れや重なりがないことを確認。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- ローカルUI確認（Playwrightスクリーンショット）
  - `.playwright-mcp/latest/settings-bottomnav-size-v2-desktop.png`
  - `.playwright-mcp/latest/settings-bottomnav-size-v2-mobile.png`

## 変更ファイル
- `denkotsu/src/components/layout/BottomNav.tsx`
- `denkotsu/docs/dev-log/035-bottom-nav-typography-and-icon-size-adjustment.md`
