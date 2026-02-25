# 067 Question Pool Expansion Stage2 To 450

- 日付: 2026-02-25

## 依頼/背景
- 問題数拡張の第2段階として、300問から450問へ増加させる。
- 第1段階と同様に、`check:data:ci` 警告ゼロとビルド成功を維持する。

## 実施内容
- `scripts/generate-question-batch.mjs` の `stage2` を実行し、150問を追加。
  - 総問題数: 300 -> 450
  - カテゴリ内訳:
    - electrical_theory: 73
    - wiring_diagram: 96
    - laws: 70
    - construction_method: 86
    - equipment_material: 72
    - inspection: 53
  - 問題形式内訳:
    - multiple_choice: 363
    - true_false: 58
    - image_tap: 29

## 検証結果
- `npm run lint`: OK
- `npm run check:data:ci`: OK
- `npm run build`: OK
  - 備考: AdSense未設定時の警告ログは継続（ビルド自体は成功）。

## 変更ファイル
- `denkotsu/src/data/questions.json`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/067-question-pool-expansion-stage2-to-450.md`
