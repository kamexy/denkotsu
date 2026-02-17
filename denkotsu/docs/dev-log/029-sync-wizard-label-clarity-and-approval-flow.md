# 029 Sync Wizard Label Clarity And Approval Flow

- 日付: 2026-02-17

## 依頼/背景
- クラウド同期ウィザードの文言と配置が分かりづらく、操作意図の理解が難しい。
- UI確認後にユーザー承認を得てからコミット/デプロイしたい。

## 実施内容
- 目的選択ボタン文言を具体化し、改行崩れが起きにくい構成へ調整。
  - `この端末をクラウドにバックアップ`
  - `クラウドのバックアップをこの端末に復元`
- 目的選択カードのレイアウトを1カラムに統一し、狭いカード幅での改行崩れ/テキスト欠けを解消。
- 「新しいコードを作る」ボタンを同期コード入力欄の直近（ラベル行）に移動し、関連性を明確化。
- STEP1の操作を整理し、保存ボタンを単独で配置。
- `AGENTS.md` に UI変更時の承認フローを追記。
  - ローカル確認（スクリーンショット共有）後、ユーザー承認までは `commit/push/deploy` を行わない。

## ローカル実装確認
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功
- Playwright スクリーンショット:
  - `/.playwright-mcp/latest/settings-sync-wizard-desktop-v4-viewport.png`
  - `/.playwright-mcp/latest/settings-sync-wizard-mobile-v4-viewport.png`

## 変更ファイル
- `denkotsu/src/app/settings/page.tsx`
- `AGENTS.md`
- `denkotsu/docs/dev-log/029-sync-wizard-label-clarity-and-approval-flow.md`
