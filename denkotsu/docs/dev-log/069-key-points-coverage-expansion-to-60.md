# 069 Key Points Coverage Expansion To 60

- 日付: 2026-02-25

## 依頼/背景
- 「要点」が問題数600問に対して不足しているため、学習導線としての網羅性と密度を高めたい。
- カテゴリ偏りをなくし、要点ページ単体でも復習が回る構成にする必要があった。

## 実施内容
- `src/data/key-points.json` を拡張し、要点を 29件 から 60件 へ増加。
- 各カテゴリを均等化し、すべて 10件 に統一。
  - electrical_theory: 7 -> 10
  - wiring_diagram: 5 -> 10
  - laws: 4 -> 10
  - construction_method: 5 -> 10
  - equipment_material: 4 -> 10
  - inspection: 4 -> 10
- 追加内容は、既存要点と重複しにくい実務観点（施工品質、測定条件、法規運用、器具選定、保守点検）を中心に作成。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK
- `npm run build`: OK
  - 備考: AdSense未設定に関する警告ログは継続（ビルド自体は成功）。

## 変更ファイル
- `denkotsu/src/data/key-points.json`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/069-key-points-coverage-expansion-to-60.md`
