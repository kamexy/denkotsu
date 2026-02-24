# 062 Warning Zero And Study Flow Tuning

- 日付: 2026-02-24

## 依頼/背景
- `check:data` の警告（90件）を全件対処し、データ品質ゲートを実質運用可能な状態に戻したい。
- 学習体験改善として、同一問題が直後に再出題される体感を抑えたい。

## 実施内容
- `validate-content.mjs` の正規化を見直し、重複選択肢の誤検知を削減。
  - 数値を削除しない通常正規化へ変更。
  - 選択肢専用の正規化関数を追加し、数式記号を保持したまま比較するよう修正。
- `questions.json` を更新。
  - 短すぎる解説文を補強（30問）。
  - 重複文言判定に該当した設問文を明確化（`q102`, `q103`, `q104`, `q105`, `q139`）。
- `check:data` の baseline を更新し、警告ゼロを正式化。
  - `scripts/validate-content-warning-baseline.json` を空配列に更新。
- `quiz-engine.ts` の出題選定を調整。
  - 直前に解いた問題を、代替問題が存在する限り次問候補から除外するガードを追加。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（警告0）
- `npm run check:data:ci`: OK
- `npm run build`: OK

## 変更ファイル
- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/src/data/questions.json`
- `denkotsu/scripts/validate-content-warning-baseline.json`
- `denkotsu/src/lib/quiz-engine.ts`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/062-warning-zero-and-study-flow-tuning.md`
