# 066 Question Pool Expansion Stage1 To 300

- 日付: 2026-02-25

## 依頼/背景
- 未完了項目のステップ3（問題数拡張）を、段階的に実施する。
- まず第1段階として、総問題数を300問まで拡張し、CIのデータ品質警告ゼロを維持する。

## 実施内容
- 問題追加用スクリプトを追加。
  - `scripts/generate-question-batch.mjs` を導入し、カテゴリ別追加数を段階指定で生成可能にした。
- Stage1（`stage1`）を実行し、113問を追加。
  - 総問題数: 187 -> 300
  - カテゴリ内訳:
    - electrical_theory: 45
    - wiring_diagram: 72
    - laws: 44
    - construction_method: 51
    - equipment_material: 47
    - inspection: 41
  - 問題形式内訳:
    - multiple_choice: 213
    - true_false: 58
    - image_tap: 29
- データ警告対策。
  - 正規化時に重複扱いになる選択肢（`1.0MΩ以上` と `10MΩ以上`）を回避するため、生成元を `1MΩ以上` に修正。

## 検証結果
- `npm run lint`: OK
- `npm run check:data:ci`: OK
- `npm run build`: OK
  - 備考: AdSense未設定時の警告ログは継続（ビルド自体は成功）。

## 変更ファイル
- `denkotsu/scripts/generate-question-batch.mjs`
- `denkotsu/src/data/questions.json`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/066-question-pool-expansion-stage1-to-300.md`
