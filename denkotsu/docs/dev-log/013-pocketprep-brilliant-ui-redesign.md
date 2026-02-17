# 013: Pocket Prep × Brilliant テイストへのUIリデザイン

**日付**: 2026-02-17

## やり取りの内容

ユーザー要望:
- 現行UIが「生成AI感」のある見た目なので、学習アプリに最適なテイストへ再設計したい
- 推奨していた `Pocket Prep × Brilliant` 方向で実装まで進める

## 実施内容

### 1. デザインシステムの再定義
- `src/app/globals.css` にデザイントークンを追加
  - 色（teal / sky / amber / orange 系）
  - サーフェス（ガラス調パネル）
  - 背景グラデーション + 形状演出
- 共通クラスを追加
  - `app-frame`
  - `panel`
  - `panel-strong`
  - `font-display`

### 2. レイアウトとナビゲーション刷新
- `src/app/layout.tsx`
  - テーマカラーを teal 系に変更
  - 画面シェルを `app-frame` 適用へ変更
- `src/components/layout/BottomNav.tsx`
  - 絵文字UIからインラインSVGアイコンへ変更
  - フローティング風パネルナビに変更
  - active/hover状態の視認性を改善

### 3. クイズ体験の再設計
- `src/app/page.tsx`
  - 上部をメーター型ヘッダーに変更（Pass Powerを強調）
  - セッション情報を整理して表示
- `src/components/quiz/QuizCard.tsx`
  - 問題カードをパネル化
  - 「QUICK QUIZ」バッジ追加
- `src/components/quiz/OptionButton.tsx`
  - 選択肢をピル番号 + 高コントラスト配色へ変更
  - 正誤状態の色設計を整理
- `src/components/quiz/QuizResult.tsx`
  - 解説/関連要点/操作ボタンをカード設計で統一
- `src/components/quiz/SessionComplete.tsx`
  - セッション完了UIを情報階層化して再配置

### 4. 要点・成績・設定画面の統一感を調整
- `src/app/learn/page.tsx`
  - ヘッダー、カテゴリタブ、カード配色を刷新
- `src/app/stats/page.tsx`
  - 各セクションをパネル化し読みやすさを改善
- `src/components/stats/CategoryBar.tsx`
  - ラベル/ゲージ配色の見直し
- `src/components/common/ProgressRing.tsx`
  - メーター色を新テーマへ統一
- `src/app/settings/page.tsx`
  - 設定項目をパネル化し、トグル配色を統一

### 5. カテゴリカラー更新
- `src/types/index.ts` の `CATEGORY_COLORS` を新テーマ配色へ更新

## 補足（ビルド安定化）

当初 `next/font/google` を使用したが、環境のネットワーク制約でビルド時に外部フォント取得が失敗。  
`layout.tsx` から Google Fonts 依存を外し、`globals.css` のローカルフォントスタックへ切り替えて安定化。

## 検証結果

- `npm run lint`: **OK**
- `npm run check:data:ci`: **OK**
- `npm run build`: **成功**

## 変更ファイル

- `denkotsu/src/app/globals.css`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/src/components/layout/BottomNav.tsx`
- `denkotsu/src/app/page.tsx`
- `denkotsu/src/components/quiz/QuizCard.tsx`
- `denkotsu/src/components/quiz/OptionButton.tsx`
- `denkotsu/src/components/quiz/QuizResult.tsx`
- `denkotsu/src/components/quiz/SessionComplete.tsx`
- `denkotsu/src/app/learn/page.tsx`
- `denkotsu/src/app/stats/page.tsx`
- `denkotsu/src/components/stats/CategoryBar.tsx`
- `denkotsu/src/components/common/ProgressRing.tsx`
- `denkotsu/src/app/settings/page.tsx`
- `denkotsu/src/types/index.ts`
- `denkotsu/docs/dev-log/013-pocketprep-brilliant-ui-redesign.md`
