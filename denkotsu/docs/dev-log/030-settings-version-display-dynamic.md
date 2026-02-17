# 030 Settings Version Display Dynamic

- 日付: 2026-02-17

## 依頼/背景
- 設定画面のバージョン表示が `1.0.0` 固定で、更新しても変わらない状態だった。

## 実施内容
- `next.config.ts` で公開環境変数を自動注入するよう変更。
  - `NEXT_PUBLIC_APP_VERSION`: `package.json` の `version` を使用
  - `NEXT_PUBLIC_APP_BUILD`: `CF_PAGES_COMMIT_SHA` または `GITHUB_SHA` の先頭7桁
- 設定画面のバージョン表示を固定値から動的表示に変更。
  - 表示形式: `version+build`（build がない場合は `version` のみ）

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功
- ローカルスクリーンショットで `バージョン: 0.1.0` を確認
  - `/.playwright-mcp/latest/settings-version-desktop-v1-full.png`
  - `/.playwright-mcp/latest/settings-version-mobile-v1-full.png`

## 変更ファイル
- `denkotsu/next.config.ts`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/docs/dev-log/030-settings-version-display-dynamic.md`
