# 059 Image Tap Marker Style Restore

- 日付: 2026-02-24

## 依頼/背景
- 画像タップ問題で、事前マーカーが記号本体に重なって見づらい。
- 「ラベルなし画像は維持し、マーカー表現だけ以前の細い輪＋小さい番号に戻したい」という要望。

## 実施内容
- `image_tap` 未回答時のマーカーUIを以前のスタイルへ調整。
  - 細いリング（透過）を記号周辺に表示
  - 右上に小さい番号バッジを表示
  - 回答前の大型番号塗りつぶしマーカーを廃止
- ラベルなし画像（`switch-quiz.svg` / `outlet-quiz.svg`）と、spoiler防止のデータ検証ルールは維持。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（既存警告のみ）
- `npm run build`: OK

## 変更ファイル
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/docs/dev-log/059-image-tap-marker-style-restore.md`
