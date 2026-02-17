# 026 Sync Code Strengthening And Generator

- 日付: 2026-02-17

## 依頼/背景
- クラウド同期コードが任意入力のみだと、`1234` など推測しやすい値が使われやすい。
- 推測耐性を上げるため、入力ルールの強化と生成導線が必要。

## 実施内容
- クライアント側の同期コード検証を強化。
  - 12〜64文字
  - 英数字・`-`・`_` のみ
  - 英字と数字を両方含む
  - 単純連番 / 同一文字列 / よく使われる弱い文字列を拒否
- 設定画面に `強いコードを生成` ボタンを追加し、推測しにくいコードを自動入力できるようにした。
- 保存 / push / pull 実行前に同一バリデーションを適用。
- Worker 側にも同等の検証を実装し、サーバー側でも弱い同期コードを受け付けないようにした。
- README に同期コード要件を追記。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功

## 変更ファイル
- `denkotsu/src/lib/cloud-sync.ts`
- `denkotsu/src/app/settings/page.tsx`
- `cloudflare/sync-worker/src/index.ts`
- `denkotsu/README.md`
- `cloudflare/sync-worker/README.md`
- `denkotsu/docs/dev-log/026-sync-code-strengthening-and-generator.md`
