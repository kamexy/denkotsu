# 055 Study Loop And Monetization Optimization

- 日付: 2026-02-23

## 依頼/背景
- `1〜4を一気に` の方針で、次の4テーマをまとめて改善したい。
  - 出題体験の最適化（同問連続抑制、カテゴリ偏り抑制の調整）
  - 問題品質チェック強化（重複/難易度偏り/画像タップ配置の監査）
  - 学習効率機能（ミス復習/弱点特訓とセッション完了時の提案）
  - 広告運用最適化（解説画面の最適配置とGA向け計測情報拡張）

## 実施内容
- 出題ロジックを拡張。
  - `quiz-engine` に `mode` / `repeatDelayQuestions` / `maxSameCategoryInWindow` を追加。
  - `mistake_focus`（ミス復習）と `weak_category`（弱点特訓）を実装。
  - 直近N問の再出題遅延を全ステップに適用し、誤答直後の同問再出題を抑止。
- 設定モデルを拡張。
  - `UserSettings` と `SyncSettingsSnapshot` に以下を追加。
    - `quizMode`
    - `repeatDelayQuestions`
    - `maxSameCategoryInWindow`
  - IndexedDB正規化とクラウド同期の sanitize / restore に反映。
- 設定画面UIを追加。
  - 出題モード切替（標準/ミスだけ復習/弱点カテゴリ特訓）
  - 再出題遅延（0/1/2/3/5問）
  - 同カテゴリ連続上限（1/2/3/4回）
- セッション完了UIを強化。
  - セッション内の誤答カテゴリを集計し、次の学習提案を表示。
  - 提案モードで即再開できる導線を追加。
- 広告運用を最適化。
  - 解説直下の新広告プレースメント `quiz_feedback` を追加。
  - `NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK` / `NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS` / `NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL` を追加。
  - テレメトリイベントに `sessionAnswered` / `questionType` を追加し、GA分析軸を拡張。
- 問題品質監査スクリプトを強化。
  - 解説短文警告
  - 選択肢重複警告
  - image_tap hotspot 近接警告
  - true/false比率偏り警告
  - 問題文の正規化重複警告
- README を更新し、新しい広告環境変数と配置を追記。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（警告のみ）
- `npm run check:monetization`: OK
- `npm run build`: OK
- ローカルUI確認（Playwright）
  - `/settings` の新設定UI表示と操作可否を確認
  - `/` で誤答後に「もう1問」実行時、同一問題の即時再出題が抑制されることを確認

## 変更ファイル
- `denkotsu/src/types/index.ts`
- `denkotsu/src/lib/db.ts`
- `denkotsu/src/lib/cloud-sync.ts`
- `denkotsu/src/lib/quiz-engine.ts`
- `denkotsu/src/hooks/useQuiz.ts`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/src/app/page.tsx`
- `denkotsu/src/components/quiz/SessionComplete.tsx`
- `denkotsu/src/components/quiz/QuizResult.tsx`
- `denkotsu/src/components/ads/AdSlot.tsx`
- `denkotsu/src/lib/telemetry.ts`
- `denkotsu/src/lib/ads.ts`
- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/README.md`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/055-study-loop-and-monetization-optimization.md`
