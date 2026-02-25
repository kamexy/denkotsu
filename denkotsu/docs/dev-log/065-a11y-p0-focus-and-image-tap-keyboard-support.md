# 065 A11y P0 Focus And Image Tap Keyboard Support

- 日付: 2026-02-25

## 依頼/背景
- 未完了項目のステップ2として、AdSense以外のP0アクセシビリティ課題を先に解消したい。
- 主に、現在地の読み上げ、キーボード操作、フォーカス可視性を改善したい。

## 実施内容
- BottomNavの現在地通知を改善。
  - アクティブタブに `aria-current=\"page\"` を付与。
  - キーボードフォーカス可視化スタイルを追加。
- 4択ボタンのフォーカス可視性を改善。
  - `focus-visible` のアウトラインを追加。
- 画像タップ問題の読み上げ補助を追加。
  - 画像タップ領域に `role=\"group\"` / `aria-describedby` を付与。
  - ホットスポットボタンに `aria-pressed` を付与。
  - 補助説明文に `id` を付与し関連付け。
- 画像ライトボックスのキーボード操作を改善。
  - サムネイル画像をボタン化し、キーボードで拡大可能に変更。
  - モーダルに `role=\"dialog\"` / `aria-modal` を付与。
  - `Esc` で閉じる挙動を追加。
  - モーダル表示時は閉じるボタンへフォーカス、閉じる時に元要素へフォーカス復帰。
  - 閉じるボタンにフォーカス可視化スタイルを追加。

## 検証結果
- `npm run test`: OK
- `npm run lint`: OK
- `npm run check:data`: OK
- `npm run build`: OK
  - 備考: AdSense未設定時の警告ログは継続（ビルド自体は成功）。

## 変更ファイル
- `denkotsu/src/components/layout/BottomNav.tsx`
- `denkotsu/src/components/quiz/OptionButton.tsx`
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/src/components/ui/ImageLightbox.tsx`
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/docs/dev-log/065-a11y-p0-focus-and-image-tap-keyboard-support.md`
