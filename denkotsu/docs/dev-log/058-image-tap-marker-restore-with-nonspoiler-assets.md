# 058 Image Tap Marker Restore With Nonspoiler Assets

- 日付: 2026-02-24

## 依頼/背景
- 画像タップ問題で答え露出を防ぐ対応後、事前マーカーが見えなくなり操作しづらいというフィードバックがあった。
- ラベルなし画像は維持しつつ、マーカーは復活させたい。

## 実施内容
- image_tap の未回答状態で、番号付きマーカーを再表示。
  - クリック領域を可視化するが、答えテキスト自体は表示しない。
- 画像タップ問題の画像は `switch-quiz.svg` / `outlet-quiz.svg` のラベルなし版を継続利用。
- 再発防止として `validate-content.mjs` を維持。
  - `image_tap` で正解語がSVGテキストに含まれる場合は `error` で落とす。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（既存警告のみ）
- `npm run check:data:ci`: OK（baseline matched, new 0）
- `npm run build`: OK

## 変更ファイル
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/src/data/questions.json`
- `denkotsu/public/images/symbols/switch-quiz.svg`
- `denkotsu/public/images/symbols/outlet-quiz.svg`
- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/docs/dev-log/058-image-tap-marker-restore-with-nonspoiler-assets.md`
