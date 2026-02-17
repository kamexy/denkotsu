# 034 Amazon Associate Tag Defaultization

- 日付: 2026-02-17

## 依頼/背景
- Amazonリンクにアソシエイト情報が確実に反映されるようにしたい。
- 利用タグは `kamexy-22` を採用する。

## 実施内容
- `src/lib/monetization.ts` に `DEFAULT_AMAZON_ASSOCIATE_TAG` を追加。
  - 既定タグを `kamexy-22` に設定。
  - `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` があれば、そちらを優先して上書き。
- `README.md` の収益化セクションを更新。
  - 未設定時に `kamexy-22` が使われる挙動を明記。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功

## 変更ファイル
- `denkotsu/src/lib/monetization.ts`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/034-amazon-associate-tag-defaultization.md`
