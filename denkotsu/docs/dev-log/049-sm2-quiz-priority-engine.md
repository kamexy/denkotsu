# 049 Sm2 Quiz Priority Engine

- 日付: 2026-02-20

## 依頼/背景
- Phase 2の実装を前に進めるため、忘却曲線ベースの出題最適化を実装する必要があった。
- 既存の出題ロジックは「未回答/間違い回数/経過時間」の簡易判定で、`spacedRepetition` を実際の出題判断に活用していなかった。

## 実施内容
- `quiz-engine` を SM-2 ベースの挙動へ更新。
  - 回答時に `spacedRepetition` を更新する処理を追加
  - quality（0-5）を正誤+回答時間から算出
  - easeFactor / intervalDays / repetitionCount / nextReviewAt を更新
- 出題優先度を次の順で再設計。
  1. 期限超過の復習問題（`nextReviewAt <= now`）
  2. 未回答問題（分野弱点を重み付け）
  3. 定着が弱い問題（`intervalDays` が短い問題）
- 出題バランス制約を整理。
  - 直近5問の同一問題再出題を回避
  - 直近10問で同一カテゴリ偏りを抑制

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/src/lib/quiz-engine.ts`
- `denkotsu/docs/dev-log/049-sm2-quiz-priority-engine.md`
