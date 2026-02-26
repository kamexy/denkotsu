# 072 practical-defect-30-marker-and-timeline

- 日付: 2026-02-26

## 依頼/背景
- 技能試験対策について、未完了だった機能を一気に実装したい。
- 具体的には、欠陥判定クイズの問題拡充（30問）、欠陥箇所マーカー表示、40分タイムライン練習の追加。

## 実施内容
- 欠陥判定クイズを10問から30問に拡張。
  - 真偽内訳: 欠陥あり20問 / 合格10問
  - 欠陥カテゴリ内訳: 圧着不良8 / 結線不良8 / 寸法不良4
- 欠陥判定データに `defectMarkerPosition` を追加し、欠陥問題では正答後に画像上へ欠陥箇所マーカーを表示。
- 欠陥箇所表示の可読性を改善。
  - マーカー表示時に画像外側を暗転し、対象箇所を強調
  - `defectMarkerLabel` を追加し、結果欄に「どこが欠陥か」をテキスト表示
- 実技トップに `40分タイムライン練習` 導線を追加。
- ` /practical/timeline ` を新規実装。
  - 40分カウントダウン
  - フェーズ手動切替（5フェーズ）
  - フェーズごとの目安時間と実績時間表示
  - 残り5分アラート
- 実技データの退行防止として、実技データとタイムライン用テストを追加。
- `docs/phase4-practical.md` を動画なし方針に更新し、実装内容と仕様の整合を取った。

## 検証結果
- `npm run test` : OK（20 tests passed）
- `npm run lint` : OK
- `npm run check:data` : OK
- `npm run build` : OK
- ローカルUI確認:
  - `/practical` で学習メニューにタイムライン導線が表示されること
  - `/practical/defects` で回答後に「欠陥箇所」マーカーが表示されること
  - `/practical/timeline` で開始・一時停止・次フェーズ遷移・実績時間更新が動作すること

## 変更ファイル
- `src/app/practical/page.tsx`
- `src/app/practical/defects/page.tsx`
- `src/app/practical/timeline/page.tsx`
- `src/data/practical-defect-questions.json`
- `src/lib/practical.ts`
- `src/lib/practical-timeline.ts`
- `src/lib/practical.test.ts`
- `src/lib/practical-timeline.test.ts`
- `docs/phase4-practical.md`
- `docs/dev-log/072-practical-defect-30-marker-and-timeline.md`
