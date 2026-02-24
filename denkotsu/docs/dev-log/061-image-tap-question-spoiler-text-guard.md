# 061 Image Tap Question Spoiler Text Guard

- 日付: 2026-02-24

## 依頼/背景
- 画像タップ問題で、問題文そのものに答え記号（`H` / `L` / `A` / `●ET` など）が含まれ、答えが推測しやすい状態だった。
- 再発防止として、データ作成ミスをCIで検知したい。

## 実施内容
- image_tap 問題文を修正（答えコードの直書きを除去）。
  - `q168`, `q169`, `q170`, `q183`, `q184`, `q185`, `q186`, `q187`
- `validate-content.mjs` を強化。
  - image_tap の問題文に `●ET` や `(H)` のような直接コードヒントが含まれる場合、`error` として失敗させるルールを追加。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（既存警告のみ）
- `npm run check:data:ci`: OK（baseline matched: 90, new: 0）
- `npm run build`: OK

## 変更ファイル
- `denkotsu/src/data/questions.json`
- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/docs/dev-log/061-image-tap-question-spoiler-text-guard.md`
