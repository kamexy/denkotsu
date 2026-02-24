# 060 SW Cache Bust For Image Tap Marker Restore

- 日付: 2026-02-24

## 依頼/背景
- 画像タップ問題のマーカー表示を戻した後も、環境によって旧UIが表示される可能性がある。
- PWA の Service Worker キャッシュが残っている場合に見た目の不一致が起こるため、反映を確実化したい。

## 実施内容
- `public/sw.js` の `CACHE_VERSION` を `2 -> 3` へ更新。
- 既存クライアントで古いキャッシュを破棄し、新しい静的アセットを取得させる。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（既存警告のみ）
- `npm run build`: OK

## 変更ファイル
- `denkotsu/public/sw.js`
- `denkotsu/docs/dev-log/060-sw-cache-bust-for-image-tap-marker-restore.md`
