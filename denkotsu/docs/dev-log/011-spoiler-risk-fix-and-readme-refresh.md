# 011: 画像ヒントリスク修正とREADME整備

**日付**: 2026-02-16

## やり取りの内容

ユーザーの「全部を自走で完了」の指示に基づき、前回残っていたデータ検証 warning を解消し、運用ドキュメントを実態に合わせて更新。

## 実施内容

### 1. 画像ヒントリスク（q107）を修正
- `public/images/circuits/3way-switch-circuit.svg` の注記テキストを見直し
  - `渡り線` ラベルを削除
  - 補足文 `1番・3番＝渡り線` を `1番・3番＝接続線` に変更
- `npm run check:data` の warning（q107）を解消

### 2. README を実プロジェクト向けに刷新
- 初期テンプレートの内容を削除し、以下を記載
  - 技術スタック
  - セットアップ手順
  - 開発コマンド（`lint` / `check:data` / `build` / `check`）
  - 主要ディレクトリ構成
  - CI品質ゲート
  - `AGENTS.md` 参照

## 検証結果

- `npm run check:data`: **OK**
- `npm run lint`: **OK**
- `npm run build`: **成功**

## 変更ファイル

- `denkotsu/public/images/circuits/3way-switch-circuit.svg`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/011-spoiler-risk-fix-and-readme-refresh.md`
