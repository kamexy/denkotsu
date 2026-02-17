# 028 Cloud Sync Dedicated Wizard

- 日付: 2026-02-17

## 依頼/背景
- クラウド同期の挙動が分かりづらく、一般ユーザーには理解が難しい。
- 「専用ウィザード」形式で、操作順序と目的を明確化する必要があった。

## 実施内容
- 設定画面のクラウド同期UIを専用ウィザードに再構成。
  - `まず目的を選択`（バックアップ / 復元）
  - `STEP 1: 同期コードを準備`
  - `STEP 2: バックアップ作成 or 復元`
- STEP 1の完了条件（有効コード + 端末保存済み）を判定し、未完了時はSTEP 2を実行不可にした。
- 文言を端末視点で統一し、通知メッセージを具体化した。

## ローカル実装確認
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功
- PlaywrightスクリーンショットでUI確認
  - `/.playwright-mcp/latest/settings-sync-wizard-desktop.png`
  - `/.playwright-mcp/latest/settings-sync-wizard-mobile.png`

## 変更ファイル
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/docs/dev-log/028-cloud-sync-dedicated-wizard.md`
