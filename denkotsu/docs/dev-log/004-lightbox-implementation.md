# 004: 画像タップ拡大（ライトボックス）の実装

**日付**: 2026-02-16

## やり取りの内容

**ユーザー**: 「画像が小さいので、タップしたら最大化表示できない？」

## 実装内容

### 新規コンポーネント
`src/components/ui/ImageLightbox.tsx` を作成：
- `createPortal` で `document.body` にオーバーレイを描画
- `framer-motion` でフェードイン/スケールアニメーション
- `e.stopPropagation()` でカードのトグルを防止
- 背景タップまたは✕ボタンで閉じる

### 統合
- `src/components/quiz/QuizCard.tsx`: `<img>` → `<ImageLightbox>` に置換
- `src/app/learn/page.tsx`: KeyPointCardの画像を `<ImageLightbox>` に置換

## 技術的ポイント

### SVGの拡大時サイズ問題
初回実装では `max-w-[92vw]` を使用したが、SVGの固有width/height属性により元のサイズ以上に拡大されなかった。
→ `w-[92vw]`（強制幅）に変更し、白背景コンテナで包むことで解決。

### イベント伝播
画像クリック → ライトボックス表示の際、親のボタン（カードトグル）にもクリックが伝播する問題。
→ `handleOpen` で `e.stopPropagation()` を使用。
