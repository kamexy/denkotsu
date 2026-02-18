# 038 Dark Theme Contrast And Svg Surface Fix

- 日付: 2026-02-18

## 依頼/背景
- ダークテーマ時にグレー系テキストが見づらい。
- 問題画像/要点画像のSVGが背景と同化して見づらい。
- SVG画像は白背景でもよいので可読性優先にしたい。

## 実施内容
- ダークテーマ用の `text-slate-*` 上書き色を1段明るく調整し、本文・補助文のコントラストを改善。
- SVG画像用に `diagram-surface` / `diagram-image` クラスを追加。
  - `diagram-surface`: 図のコンテナ背景と境界線を固定（ダークでも白系背景）
  - `diagram-image`: SVG画像本体の背景を固定（透過SVGでも視認性を確保）
- クイズ画像コンテナ（`QuizCard`）と要点画像コンテナ（`learn/page`）を `diagram-surface` に統一。
- `ImageLightbox` で `.svg` のときのみ `diagram-image` を適用（通常画像は既存表示を維持）。
- クイズ回答後（正解/不正解）の選択肢文字色をダークテーマ向けに再調整。
  - `text-emerald-900` / `text-rose-900` をダーク時に明るい色へ上書きし、背景色とのコントラストを確保。
- `fix` ルールに従い、アプリバージョンを `0.2.0` から `0.2.1` に更新。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/src/app/globals.css`
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/src/app/learn/page.tsx`
- `denkotsu/src/components/ui/ImageLightbox.tsx`
- `denkotsu/docs/dev-log/038-dark-theme-contrast-and-svg-surface-fix.md`
