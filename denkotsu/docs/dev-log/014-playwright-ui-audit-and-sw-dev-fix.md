# 014: PlaywrightでUI再監査・開発時SWキャッシュ問題を修正

**日付**: 2026-02-17

## やり取りの内容

ユーザーから「UIが崩れて見える。Playwrightで実画面確認して修正してほしい」と依頼。

## 調査

- Playwright（Chromium）で `/settings`, `/stats`, `/learn`, `/` をスクリーンショット取得して実機確認。
- 取得結果では新UI自体は反映されていたが、以下の問題を確認:
  1. `/learn` が初期表示で空白になり得る（`Suspense` の fallback 未設定）
  2. 開発環境でも Service Worker が有効で、古いキャッシュにより旧UIが残る可能性が高い

## 実施した修正

### 1. 開発時はService Workerを無効化
- `src/lib/register-sw.ts`
  - `NODE_ENV !== "production"` の場合:
    - 既存のService Workerを `unregister()`
    - Cache API のキーを削除
  - これにより、開発中のCSS/JSが古いキャッシュで上書きされる問題を防止

### 2. `/learn` の初期空白を解消
- `src/app/learn/page.tsx`
  - `Suspense` に `fallback={<LearnFallback />}` を追加
  - ローディング中でもヘッダー/タブ/カードのスケルトンを表示

## Playwright再検証

- `npx playwright screenshot`（Chromium）で以下を再取得し確認:
  - `/settings`（desktop/mobile）
  - `/stats`（desktop）
  - `/learn`（desktop、待機付き）
  - `/`（desktop/mobile）
- すべて新UIで表示されることを確認。

## 検証結果

- `npm run lint`: **OK**
- `npm run check:data:ci`: **OK**
- `npm run build`: **成功**

## 変更ファイル

- `denkotsu/src/lib/register-sw.ts`
- `denkotsu/src/app/learn/page.tsx`
- `denkotsu/docs/dev-log/014-playwright-ui-audit-and-sw-dev-fix.md`
