# 082 Theme Hydration Mismatch Fix

- 日付: 2026-04-07
- 依頼/背景: `/guides` などの画面で、テーマ初期化時に `data-theme-preference` / `data-theme` の hydration mismatch が発生していた。
- 実施内容:
  - `src/app/layout.tsx` の `<html>` に `suppressHydrationWarning` を追加。
  - ローカルストレージ由来のテーマ属性を hydration 前スクリプトで反映する現行構成に対して、React 側に差分を許容させた。
  - テーマ関連の参照箇所を全検索し、今回の不一致の主因が `<html>` 属性差分であることを確認した。
- 検証結果:
  - `npm run lint`
  - `npm run check:data`
  - `npm run build`
- 変更ファイル:
  - `src/app/layout.tsx`
  - `docs/dev-log/082-theme-hydration-mismatch-fix.md`
