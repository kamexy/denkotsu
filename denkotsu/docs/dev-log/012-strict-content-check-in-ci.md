# 012: CIでデータ検証 warning を失敗扱いに強化

**日付**: 2026-02-16

## やり取りの内容

「全部を自走で完了」の方針に沿って、品質ゲートを追加で強化。  
将来の画像ヒント混入やデータ品質低下を、CI段階で確実に止められるようにした。

## 実施内容

### 1. `validate-content` に strict モードを追加
- `scripts/validate-content.mjs` に `--fail-on-warn` を追加
- warning が1件でもある場合、strict モードでは終了コード1で失敗させるよう変更

### 2. npm scripts を追加
- `package.json` に `check:data:ci` を追加
  - `node scripts/validate-content.mjs --fail-on-warn`

### 3. CI設定を更新
- `.github/workflows/ci.yml` のデータ検証を `check:data` から `check:data:ci` に変更
- これにより、warning でも PR / push で失敗する

## 検証結果

- `npm run check:data`: **OK**
- `npm run check:data:ci`: **OK**
- `npm run lint`: **OK**
- `npm run build`: **成功**

## 変更ファイル

- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/package.json`
- `.github/workflows/ci.yml`
- `denkotsu/docs/dev-log/012-strict-content-check-in-ci.md`
