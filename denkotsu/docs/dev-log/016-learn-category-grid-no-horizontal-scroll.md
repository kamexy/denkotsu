# 016: 要点カテゴリをグリッド化して横スクロール依存を解消

**日付**: 2026-02-17

## やり取りの内容

ユーザーから「要点カテゴリの横スクロールは認知負荷が高い」と指摘。

## 実施内容

### 1. カテゴリ選択UIを横スクロールからグリッドへ変更
- `src/app/learn/page.tsx`
  - カテゴリタブ領域を `overflow-x` + 横並びから、折り返しグリッドへ変更
  - `grid-cols-2`（mobile） / `sm:grid-cols-3`（desktop）で常時可視化
  - 各タブを `w-full` の中央揃えに変更し、読みやすさを維持

### 2. ローディングfallbackも同じ情報設計へ統一
- `LearnFallback` のカテゴリ骨組みをグリッド表示へ変更
- 初期表示と読み込み後表示で認知差が出ないように調整

## 検証

- `npm run lint`: **OK**
- `npm run check:data:ci`: **OK**
- `npm run build`: **成功**
- Playwright（Chromium）で `/learn` を再撮影
  - desktop / mobile viewport とも横スクロール不要を確認

## 変更ファイル

- `denkotsu/src/app/learn/page.tsx`
- `denkotsu/docs/dev-log/016-learn-category-grid-no-horizontal-scroll.md`
