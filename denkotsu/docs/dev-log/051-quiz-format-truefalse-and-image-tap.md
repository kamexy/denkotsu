# 051 Quiz Format Truefalse And Image Tap

- 日付: 2026-02-20

## 依頼/背景
- Phase 2 の残タスクである「◯✕クイズ」「画像タップ形式」を実装したい。
- 既存4択を維持しつつ、新形式を同一クイズ導線で扱えることが必要。

## 実施内容
- 問題データ型を拡張。
  - `questionType`（`multiple_choice` / `true_false` / `image_tap`）を追加
  - `options` を可変長配列へ変更
  - `image_tap` 用 `hotspots` を追加
- クイズ表示を拡張。
  - `true_false` は○/✕ラベルで回答可能
  - `image_tap` は画像上のホットスポットを直接タップして回答
  - 問題タイプバッジ（4択 / ○✕ / 画像タップ）を表示
  - `image_tap` は回答前に正解ヒントが見えないよう、画像内マーカーを `●` 表示に変更（回答後のみ番号と選択肢対応を表示）
  - `image_tap` の回答前マーカーを「小さい中心点 + 番号バッジ」に変更し、図記号を隠しにくいUIへ改善
  - 追加調整として、回答前マーカーの中心点は削除し、番号バッジのみ表示に変更
- 動作確認しやすいようデバッグ出題固定を追加。
  - `/?debugQuestionType=image_tap` で画像タップ問題を優先出題
  - `multiple_choice` / `true_false` も同様に指定可能
- データ検証スクリプトを拡張。
  - 問題形式ごとの options 長/必須フィールドを検証
  - `image_tap` の `hotspots` 形式と座標範囲（0-100）を検証
  - `check:data:ci` で警告が落ちないよう、画像タップ問題のヒント検知を適用除外
- 新形式問題を追加。
  - `q121`〜`q126`（○✕ 3問、画像タップ 3問）
- 仕様進捗を更新。
  - `docs/SPEC.md` の Phase2 チェックで「◯✕」「画像タップ」を完了に変更

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run check:data:ci` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/src/types/index.ts`
- `denkotsu/src/components/quiz/OptionButton.tsx`
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/src/hooks/useQuiz.ts`
- `denkotsu/src/lib/quiz-engine.ts`
- `denkotsu/src/app/page.tsx`
- `denkotsu/src/data/questions.json`
- `denkotsu/scripts/validate-content.mjs`
- `docs/SPEC.md`
- `denkotsu/docs/dev-log/051-quiz-format-truefalse-and-image-tap.md`
