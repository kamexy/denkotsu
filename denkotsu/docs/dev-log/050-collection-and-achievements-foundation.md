# 050 Collection And Achievements Foundation

- 日付: 2026-02-20

## 依頼/背景
- Phase 2 の「コレクション機能」と「実績システム」を同時に実装して前進させたい。
- 既存の学習導線（クイズ→結果）に、報酬体験を追加して継続学習の動機づけを強化したい。

## 実施内容
- 図鑑/実績のデータモデルを追加。
  - `UserCollection`（取得済みアイテム）
  - `AchievementDefinition` / `AchievementUnlock`（実績定義と解除履歴）
- IndexedDB スキーマを v2 へ拡張し、`collections` / `achievementUnlocks` テーブルを追加。
- コレクション基盤を実装。
  - 50アイテムの図鑑データを追加
  - 正解時 30% ドロップ判定
  - レアリティ重み（normal 70% / rare 25% / legendary 5%）
  - 未取得アイテム優先でのドロップ
- 実績基盤を実装。
  - 15実績定義を追加
  - 回答後に都度判定し、新規解除のみ保存
  - 連続正解、累計回答、合格力、図鑑収集、全分野回答を判定条件に含めた
- クイズ結果画面に報酬フィードバックを追加。
  - NEWアイテム表示
  - 新規実績解除表示
- 新規タブ `/collection`（図鑑と実績）を実装。
  - 収集率・実績解除率サマリ
  - レアリティフィルタ付き図鑑一覧
  - 実績一覧（達成/未達成）
- 下部ナビに「図鑑」タブを追加。
- クラウド同期スナップショットに図鑑/実績データを含めるよう拡張。
- `docs/SPEC.md` の Phase 2 進捗チェックを実装状態に更新。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/src/types/index.ts`
- `denkotsu/src/lib/db.ts`
- `denkotsu/src/lib/cloud-sync.ts`
- `denkotsu/src/lib/collection.ts`
- `denkotsu/src/lib/achievements.ts`
- `denkotsu/src/data/collection-items.json`
- `denkotsu/src/hooks/useQuiz.ts`
- `denkotsu/src/app/page.tsx`
- `denkotsu/src/components/quiz/QuizResult.tsx`
- `denkotsu/src/components/layout/BottomNav.tsx`
- `denkotsu/src/app/collection/page.tsx`
- `docs/SPEC.md`
- `denkotsu/docs/dev-log/050-collection-and-achievements-foundation.md`
