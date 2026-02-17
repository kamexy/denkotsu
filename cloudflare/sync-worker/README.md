# denkotsu-sync Worker

第二種電気工事士アプリ「デンコツ」のクラウド同期 API（D1 バックエンド）です。

## セットアップ

1. D1 を作成

```bash
npx wrangler d1 create denkotsu_sync
```

2. `wrangler.jsonc` の `database_id` を設定

3. マイグレーション適用

```bash
npx wrangler d1 migrations apply denkotsu_sync --remote
```

4. デプロイ

```bash
npx wrangler deploy
```

## API

- `POST /api/sync/push`
- `GET /api/sync/pull?syncId=...`
- `GET /healthz`

## 注意

- 現在は「同期コード」ベースの簡易認証（β）です。
- 同期コードは 12〜64 文字で、英字+数字を含み、推測されやすい値（例: `123456`）は拒否します。
- 本番運用では OAuth ログイン連携（Google/Apple）を追加してください。
