# 039 Svg Text Overlap Audit And Fixes

- 日付: 2026-02-19

## 依頼/背景
- SVG画像内で文字が他要素に重なって読みにくい箇所がある。
- 単発対応ではなく、全SVGを調査して同様の問題もあわせて修正したい。

## 実施内容
- `denkotsu/public/images/**/*.svg` を全件対象に、`text` 要素同士の重なりを自動検査。
- 追加で `text` と `line` 要素の重なり候補も自動検査。
- 検査で重なり候補が出た5ファイルを修正。
  - `circuits/single-phase-2wire.svg`
    - `100V` ラベル位置を左へ移動（`負荷` ラベルとの重なりを解消）
    - `N(白)` ラベルを左へ移動（接地記号との重なりを解消）
  - `circuits/parallel-circuit.svg`
    - 電源記号の `V` ラベルを下へ移動（`−` 記号との重なりを回避）
  - `circuits/single-to-multi.svg`
    - 矢印 `↓` と `変換` テキストの縦位置を調整
    - `N` ラベル位置を下へ移動（下部配線との重なりを回避）
  - `tools/clamp-meter.svg`
    - `電線` ラベル位置を上へ微調整（導体線との接触を回避）
  - `tools/megger.svg`
    - `MΩ` ラベル位置を下へ移動（針線との重なりを回避）
- 修正後に同検査を再実行し、重なり候補ゼロを確認。
- ユーザー確認フィードバックを受け、見た目上の違和感があった3ファイルを追加調整。
  - `circuits/single-phase-2wire.svg`
    - `N(白)` ラベルを右側の空き領域へ再配置（変圧器付近への重なり感を解消）
  - `tools/megger.svg`
    - 赤い針の起点/終点をメーター中央基準に再配置
    - `125V` `250V` `500V` ラベルをダイヤル周辺で読みやすい位置へ再配置
  - `tools/clamp-meter.svg`
    - ダイヤルの `A` / `V` ラベルを視認しやすい位置へ再配置

## 検証結果
- SVG重なり再検査: `NO_TEXT_OVERLAP`
- SVG再検査（文字と線）: `NO_TEXT_LINE_OVERLAP_EXCEPT_TERMINAL0`
  - `3way-switch-circuit.svg` の `0` は端子中央の意図した表示として除外
- `npm run lint` 成功
- `npm run check:data` 成功

## 変更ファイル
- `denkotsu/public/images/circuits/single-phase-2wire.svg`
- `denkotsu/public/images/circuits/parallel-circuit.svg`
- `denkotsu/public/images/circuits/single-to-multi.svg`
- `denkotsu/public/images/tools/clamp-meter.svg`
- `denkotsu/public/images/tools/megger.svg`
- `denkotsu/docs/dev-log/039-svg-text-overlap-audit-and-fixes.md`
