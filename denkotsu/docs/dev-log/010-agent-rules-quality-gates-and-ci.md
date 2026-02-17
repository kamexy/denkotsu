# 010: エージェント共通運用ルールと品質ゲートの整備

**日付**: 2026-02-16

## やり取りの内容

ユーザーから、今後の開発で以下を必須化する依頼:
- 変更のたびに dev-log を追加する
- 変更を適切な単位で git コミットする
- Codex / Claude Code 共通で守れるよう、振る舞い定義に明記する

加えて、前回提案した品質改善（自動チェックとCI）に着手。

## 実施内容

### 1. 共通運用ルールを明文化
- ルートに `AGENTS.md` を新規作成
- Codex / Claude Code 共通ルールとして以下を定義:
  - 変更時の dev-log 追加（`denkotsu/docs/dev-log/`）
  - 適切な粒度での git コミット（Conventional Commits 推奨）
  - コミット前の品質確認（lint / data check / build）

### 2. lint 警告の解消
- `src/lib/quiz-engine.ts` の未使用 import を削除
- `src/lib/pass-power.ts` の未使用 import を削除
- `src/components/ui/ImageLightbox.tsx` を `<img>` から `next/image` に変更

### 3. build の安定化
- `package.json` の `build` を `next build --webpack` に変更
- `build:turbopack` を別スクリプトとして追加

### 4. データ整合・ネタバレ検査の自動化
- `scripts/validate-content.mjs` を新規作成
- 検証内容:
  - questions / key-points の構造・ID重複
  - カテゴリ妥当性
  - 画像ファイル存在確認
  - SVGテキスト内への正解選択肢混入（ネタバレ）検出
- `npm run check:data` スクリプトを追加

### 5. CI の追加
- `.github/workflows/ci.yml` を新規作成
- `lint` / `check:data` / `build` を自動実行

## 検証結果

- `npm run lint`: **0 errors / 0 warnings**
- `npm run check:data`: **OK**（warning 1件）
  - q107 で誤答選択肢「渡り線」が SVG テキストに含まれるヒントリスクを検知
- `npm run build`: **成功**（静的ページ生成完了）

## 変更ファイル

- `AGENTS.md`
- `.github/workflows/ci.yml`
- `denkotsu/package.json`
- `denkotsu/scripts/validate-content.mjs`
- `denkotsu/src/components/ui/ImageLightbox.tsx`
- `denkotsu/src/lib/pass-power.ts`
- `denkotsu/src/lib/quiz-engine.ts`
- `denkotsu/docs/dev-log/010-agent-rules-quality-gates-and-ci.md`
