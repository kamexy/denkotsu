# 040 Monetization Env Validation And Ci Guard

- 日付: 2026-02-19

## 依頼/背景
- 収益化（AdSense / Amazonアソシエイト）を早めに本番運用したい。
- 設定ミスがあると、広告が出ない・成果計測されない状態に気づきづらい。

## 実施内容
- 収益化用の環境変数検証スクリプトを追加。
  - `scripts/validate-monetization-env.mjs`
  - `npm run check:monetization` で実行可能に設定。
  - 検証内容:
    - `NEXT_PUBLIC_ADSENSE_ENABLED=1` 時に `NEXT_PUBLIC_ADSENSE_CLIENT_ID` 形式チェック
    - `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE`（数字のみ）チェック
    - `NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS`（1以上整数）チェック
    - `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG` 指定時の `xxxxx-22` 形式チェック
- CI に収益化設定チェックを追加。
  - `.github/workflows/ci.yml` に `Validate monetization env` ステップを追加。
- ランタイム側の安全性を強化。
  - `src/lib/ads.ts`:
    - AdSense `client_id` / `slot` の形式検証を追加。
    - 不正値時は広告スクリプト注入や実広告描画を抑止。
    - 警告メッセージ取得関数 `getAdsenseWarnings()` を追加。
  - `src/lib/monetization.ts`:
    - Amazonタグの形式検証を追加。
    - 不正値時は既定タグ `kamexy-22` にフォールバック。
    - 警告メッセージ取得関数 `getMonetizationWarnings()` を追加。
  - `src/app/layout.tsx` / `RecommendedToolsSection.tsx`:
    - 収益化設定の警告をログ出力し、設定不備の早期発見を可能化。
- README を更新し、設定ルールとチェックコマンドを明記。
- `feat` ルールに従い、アプリバージョンを `0.2.2` から `0.3.0` に更新。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run check:monetization` 成功
- `npm run build` 成功

## 変更ファイル
- `.github/workflows/ci.yml`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/README.md`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/src/lib/ads.ts`
- `denkotsu/src/lib/monetization.ts`
- `denkotsu/src/components/monetization/RecommendedToolsSection.tsx`
- `denkotsu/docs/dev-log/040-monetization-env-validation-and-ci-guard.md`
