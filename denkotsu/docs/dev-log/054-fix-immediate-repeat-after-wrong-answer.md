# 054 Fix Immediate Repeat After Wrong Answer

- 日付: 2026-02-23

## 依頼/背景
- 問題を間違えた直後に、同じ問題が連続で出題される挙動が続いていた。
- 学習体験として単調で、確認上も不自然なため出題ロジックの見直しが必要だった。

## 実施内容
- 出題エンジンに「直前に回答した問題ID」を取得する処理を追加。
- 候補から直前問題を除外する共通処理を追加（ただし候補が1問しかない場合は除外しない）。
- 上記除外を以下に適用。
  - 期限到来復習（Step1）
  - 定着弱い問題（Step3）
  - 最終フォールバックのランダム選択
- これにより、誤答直後の同一問題連続出題を原則回避するように変更。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/src/lib/quiz-engine.ts`
- `denkotsu/docs/dev-log/054-fix-immediate-repeat-after-wrong-answer.md`
