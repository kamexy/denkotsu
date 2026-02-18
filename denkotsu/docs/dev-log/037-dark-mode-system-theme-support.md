# 037 Dark Mode System Theme Support

- 日付: 2026-02-18

## 依頼/背景
- アプリ全体をダークモード対応したい。
- テーマは `ライト` / `ダーク` を固定選択でき、デフォルトは `システム連動` にしたい。

## 実施内容
- 設定モデルに `themePreference`（`system | light | dark`）を追加。
- IndexedDB の設定取得/正規化にテーマを組み込み、未設定時は `system` を補完。
- クラウド同期スナップショットに `themePreference` を追加し、復元時にも反映。
- 起動直後のテーマちらつき防止のため、`layout.tsx` に初期化スクリプトを追加。
- `ThemeBootstrap` を追加し、`localStorage` と DB 設定からテーマを確定適用。
- `CloudSyncBootstrap` を拡張し、起動時クラウド復元後のテーマも再適用。
- 設定画面にテーマ選択 UI（システム/ライト/ダーク）を追加。
- `globals.css` にダーク用トークンと主要ユーティリティのダーク上書きを追加し、全画面の視認性を確保。
- 今後の運用ルールとして、UI確認時のスクリーンショット共有必須を解除（`AGENTS.md` 更新）。
- `feat` ルールに従い、アプリバージョンを `0.1.0` から `0.2.0` に更新。
- 今後は `fix/feat/feat!` コミット時に、`npm version ... --no-git-tag-version` を実行して同コミットへ含める運用を `AGENTS.md` に明記。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功
- ローカル UI 確認（Playwright スクリーンショット）
  - `.playwright-mcp/latest/settings-theme-light-mobile.png`
  - `.playwright-mcp/latest/settings-theme-dark-mobile.png`
  - `.playwright-mcp/latest/settings-theme-system-dark-mobile.png`
  - `.playwright-mcp/latest/theme-dark-home-mobile.png`
  - `.playwright-mcp/latest/theme-dark-learn-mobile.png`
  - `.playwright-mcp/latest/theme-dark-stats-mobile.png`

## 変更ファイル
- `AGENTS.md`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/src/types/index.ts`
- `denkotsu/src/lib/db.ts`
- `denkotsu/src/lib/cloud-sync.ts`
- `denkotsu/src/lib/theme.ts`
- `denkotsu/src/components/layout/ThemeBootstrap.tsx`
- `denkotsu/src/components/layout/CloudSyncBootstrap.tsx`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/src/app/globals.css`
- `denkotsu/docs/dev-log/037-dark-mode-system-theme-support.md`
