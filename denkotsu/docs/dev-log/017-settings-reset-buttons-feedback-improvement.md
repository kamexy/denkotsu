# 017: 設定 > データ のリセット/キャンセル操作フィードバックを改善

**日付**: 2026-02-17

## やり取りの内容

ユーザーから「設定 > データ のリセットとキャンセルボタンが、UIフィードバック不足で分かりづらい」と指摘。

## 実施内容

### 1. ボタン状態フィードバックを追加
- `src/app/settings/page.tsx`
  - リセットボタン:
    - hover/active/focus-visible を追加
    - 処理中は `disabled` + スピナー + 「リセット中...」表示
  - キャンセルボタン:
    - hover/active/focus-visible を追加
    - 処理中は `disabled`

### 2. 操作結果フィードバックを追加
- キャンセル押下時に「キャンセルしました」を一時表示
- リセット完了時の「リセットしました」メッセージは `aria-live` で通知
- リセット確認を開いた時に、既存の通知状態をクリア

### 3. 内部状態を追加
- `resetPending`
- `cancelNotice`
- `handleCancelReset` ハンドラ

## Playwright検証

クリック操作付きで検証を実施（Chromium）:
- 確認ダイアログ表示状態のスクリーンショット取得
- キャンセル押下後の通知表示状態のスクリーンショット取得

## 検証結果

- `npm run lint`: **OK**
- `npm run check:data:ci`: **OK**
- `npm run build`: **成功**

## 変更ファイル

- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/docs/dev-log/017-settings-reset-buttons-feedback-improvement.md`
