# 045 Adsense Production Configuration Completion

- 日付: 2026-02-19

## 依頼/背景
- AdSense の審査・本番運用に向け、リポジトリ側の設定を「未反映箇所なし」の状態にしたい。
- 既存の deploy workflow では GA は注入済みだが、AdSense/収益化関連の公開環境変数がビルドに渡っていなかった。

## 実施内容
- Cloudflare Pages デプロイ workflow に、収益化/AdSense関連の公開環境変数を追加。
- デプロイ時に `npm run check:monetization` を実行し、設定不整合を早期検知できるようにした。
- `public/ads.txt` を実パブリッシャーID行へ更新。
- `check:monetization` で、`NEXT_PUBLIC_ADSENSE_CLIENT_ID` と `public/ads.txt` の整合性を検証するチェックを追加。
- README の GitHub Secrets 一覧と AdSense 章を更新し、必要設定を明確化。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run check:monetization` 成功

## 変更ファイル
- `.github/workflows/deploy-pages.yml`
- `denkotsu/public/ads.txt`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/045-adsense-production-configuration-completion.md`
