# 056 Data CI Warning Baseline

- 日付: 2026-02-23

## 依頼/背景
- GitHub Actions の `npm run check:data:ci` が、既存データの警告90件により失敗した。
- 新しい警告ルールは維持しつつ、CI を「新規警告のみ失敗」にしたい。

## 実施内容
- `validate-content.mjs` に警告ベースライン機能を追加。
  - `--baseline <path>`: 既知警告を読み込み、新規警告との差分だけを strict 判定。
  - `--write-baseline <path>`: 現在の警告一覧をベースラインJSONとして出力。
- `package.json` を更新。
  - `check:data:ci` をベースライン付き strict 実行へ変更。
  - `check:data:update-baseline` を追加。
- 既存警告90件を `scripts/validate-content-warning-baseline.json` に保存。
- README に CIチェックとベースライン更新コマンドを追記。

## 検証結果
- `npm run lint`: OK
- `npm run check:data`: OK（警告90件）
- `npm run check:data:ci`: OK（baseline matched: 90, new: 0）

## 変更ファイル
- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/scripts/validate-content-warning-baseline.json`
- `denkotsu/package.json`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/056-data-ci-warning-baseline.md`
