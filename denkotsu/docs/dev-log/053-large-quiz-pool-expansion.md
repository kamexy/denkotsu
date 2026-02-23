# 053 Large Quiz Pool Expansion

- 日付: 2026-02-20

## 依頼/背景
- 画像タップ問題と○✕問題を、学習で体感できるレベルまで一気に増やしたい要望があった。
- 既存の出題形式拡張（4択/○✕/画像タップ）を活かし、問題プールを大幅に拡張する。

## 実施内容
- 問題データを 50 問追加した（`q138`〜`q187`）。
  - `true_false`: 30問
  - `image_tap`: 20問
- `image_tap` は既存SVG図版を再利用し、ホットスポットを追加拡張。
  - `switch-all.svg`: 上段4種 + 下段3種（H/L/A）対応
  - `outlet-all.svg`: 6種（一般/E/ET/EET/20A/WP）対応
  - `light-ceiling.svg`: 2種（シーリングライト/引掛シーリング）
- 追加後の総問題数は 187 問。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/src/data/questions.json`
- `denkotsu/docs/dev-log/053-large-quiz-pool-expansion.md`
