# 063 Learning Continuity Goals And Weekly Review

- 日付: 2026-02-24

## 依頼/背景
- 未完了だった学習体験改善（AdSense以外）を一括で完了したい。
- 対象は、連続学習日数・目標設定・週次ふりかえり・セッション完了後の次アクション強化。

## 実施内容
- `UserSettings` を拡張し、目標設定を追加。
  - `dailyGoalQuestions`（1日の目標問題数）
  - `weeklyGoalStudyDays`（1週間の目標学習日数）
- DB正規化とデフォルト設定を更新。
  - 既存ユーザーでも不足項目を自動補完するよう `getSettings` を更新。
- クラウド同期の設定スナップショットへ目標項目を追加。
  - push/pull 適用時に目標値が欠落しないよう更新。
- 学習インサイト計算ロジックを新規追加。
  - 連続学習日数
  - 今日の目標進捗（達成/残り）
  - 週次ふりかえり（問題数・正解率・学習日数・前週比）
- 設定画面に学習目標UIを追加。
  - 1日目標問題数
  - 週間目標学習日数
- 成績画面に継続指標と週次ふりかえりを追加。
  - 連続学習、今日の目標、週次メトリクス、前週比、目標達成状態を表示。
- セッション完了画面の導線を強化。
  - 既存の復習提案に加えて、日次目標の残数ベースの次アクション提案を追加。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK
- `npm run check:data:ci`: OK
- `npm run build`: OK
  - 備考: AdSense未設定時の警告ログは継続（ビルド自体は成功）。

## 変更ファイル
- `denkotsu/src/types/index.ts`
- `denkotsu/src/lib/db.ts`
- `denkotsu/src/lib/cloud-sync.ts`
- `denkotsu/src/lib/study-insights.ts`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/src/app/stats/page.tsx`
- `denkotsu/src/components/quiz/SessionComplete.tsx`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/063-learning-continuity-goals-and-weekly-review.md`
