# 052 Quiz Format Question Pool Expansion

- 日付: 2026-02-20

## 依頼/背景
- 画像タップ問題が出題されにくく、動作確認しづらい状態だった。
- 画像タップと○✕問題を増やして、学習体験と検証しやすさを高めたい要望があった。

## 実施内容
- 新形式問題を 11 問追加した。
  - `true_false`: 5問（`q127`〜`q131`）
  - `image_tap`: 6問（`q132`〜`q137`）
- 追加した画像タップ問題は既存の図版（`switch-all.svg` / `outlet-all.svg` / `light-ceiling.svg`）を再利用し、既存ホットスポット定義と整合する内容で作成した。
- 追加した○✕問題は、既存問題の説明内容と矛盾しない事実ベースの設問のみを採用した。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/src/data/questions.json`
- `denkotsu/docs/dev-log/052-quiz-format-question-pool-expansion.md`
