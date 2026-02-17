# 024: クラウド同期基盤を追加（D1 + Worker + 設定画面）

**日付**: 2026-02-17

## やり取りの内容

「クラウド同期は無料でできるか」の確認後、  
Phase 2 の着手としてクラウド同期の最小実装を追加。

## 実施内容

### 1. フロント側に同期機能を実装
- `src/lib/cloud-sync.ts` を追加
  - ローカルスナップショット生成
  - `push` / `pull` API 呼び出し
  - リモートスナップショットのローカル反映
  - 起動時 pull（新しい場合のみ）
  - 回答後のバックグラウンド push
- `src/hooks/useQuiz.ts` で回答記録後にバックグラウンド同期を実行
- `src/components/layout/CloudSyncBootstrap.tsx` を追加し起動時同期を実行
- `src/app/layout.tsx` で `connect-src` に同期APIオリジンを許可

### 2. 設定画面に同期UIを追加
- `src/app/settings/page.tsx`
  - 同期コード入力
  - 同期コード保存
  - クラウドへ保存（push）
  - クラウドから復元（pull）
  - 最終同期時刻の表示
  - 未設定時のガイド表示

### 3. 設定スキーマ拡張
- `UserSettings` に以下を追加
  - `syncId`
  - `lastSyncedAt`
  - `updatedAt`
- `src/lib/db.ts` で既存データを後方互換で正規化

### 4. Worker + D1 同期APIの雛形を追加
- `cloudflare/sync-worker/src/index.ts`
  - `POST /api/sync/push`
  - `GET /api/sync/pull`
  - `GET /healthz`
  - Last-Write-Wins（タイムスタンプ比較）
- `cloudflare/sync-worker/migrations/0001_create_sync_snapshots.sql`
- `cloudflare/sync-worker/wrangler.jsonc`

### 5. README に導入手順を追記
- `denkotsu/README.md` に D1 作成・migration・worker deploy・環境変数設定手順を追加

## 変更ファイル

- `denkotsu/src/types/index.ts`
- `denkotsu/src/lib/db.ts`
- `denkotsu/src/lib/cloud-sync.ts`
- `denkotsu/src/hooks/useQuiz.ts`
- `denkotsu/src/components/layout/CloudSyncBootstrap.tsx`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/src/app/settings/page.tsx`
- `cloudflare/sync-worker/src/index.ts`
- `cloudflare/sync-worker/wrangler.jsonc`
- `cloudflare/sync-worker/migrations/0001_create_sync_snapshots.sql`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/024-cloud-sync-foundation-with-d1-worker.md`
