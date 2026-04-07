# 081 user-facing-copy-sweep

- 日付: 2026-04-07
- 依頼/背景: ガイドや要点ページに、AdSense審査や静的URLなど実装都合ベースの文言が残っていたため、ユーザー向けの自然なコピーへ修正する。
- 実施内容:
  - `guides` の説明文から AdSense 審査や静的 URL などの内部事情を除去した。
  - `key-points` のメタ情報と説明文から実装都合の表現を除去した。
  - トップページの `公開要点ページ` などのラベルを、学習行動に即した表現へ変更した。
  - 学習ガイド本文に残っていた `審査向け` の見出しを、学習設計の説明へ差し替えた。
- 検証結果:
  - `npm run lint`
  - `npm run check:data`
  - `npm run build`
- 変更ファイル:
  - `src/app/guides/page.tsx`
  - `src/app/key-points/page.tsx`
  - `src/app/page.tsx`
  - `src/lib/guides.ts`
  - `src/app/practical/defects/page.tsx`
