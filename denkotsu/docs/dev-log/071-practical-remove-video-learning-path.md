# 071 practical-remove-video-learning-path

- 日付: 2026-02-26

## 依頼/背景
- 実技学習の動画品質が期待に届かず、動画機能は一旦廃止したい。
- 実技タブは、複線図ステップ練習と欠陥判定クイズ中心に戻す。

## 実施内容
- 実技タブを追加し、実技トップ `/practical` を実装。
- 学習メニューは動画なしの2導線に統一。
  - `複線図ステップ練習`（候補13問）
  - `欠陥判定クイズ`
- ダークテーマで実技図が見辛くなる問題を修正。
  - 実技図コンテナに `diagram-surface` を適用
  - 実技図画像に `diagram-image` を適用
  - 要点/クイズと同じ図面背景表示に統一
- 実技データとローカル進捗ロジックを動画非依存で実装。
  - 候補13問の手順データ
  - 欠陥判定クイズデータ
  - 候補問題チェックの進捗保存（localStorage）

## 検証結果
- `npm run lint` : OK
- `npm run check:data` : OK
- `npm run build` : OK
- `/practical` の画面確認で、動画導線が存在しないことを確認
- `/practical/wiring` の画面確認で、図背景がライト/ダークとも可読性を保つことを確認

## 変更ファイル
- `src/components/layout/BottomNav.tsx`
- `src/app/practical/page.tsx`
- `src/app/practical/wiring/page.tsx`
- `src/app/practical/defects/page.tsx`
- `src/lib/practical.ts`
- `src/lib/practical-progress.ts`
- `src/data/practical-wiring-problems.json`
- `src/data/practical-defect-questions.json`
- `docs/dev-log/071-practical-remove-video-learning-path.md`
