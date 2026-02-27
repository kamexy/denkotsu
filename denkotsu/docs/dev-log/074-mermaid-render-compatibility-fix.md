# 074 mermaid-render-compatibility-fix

- 日付: 2026-02-27

## 依頼/背景

- `docs/architecture.md` の Mermaid 図が、閲覧環境によってパースエラーになって表示できないとの報告。
- エラー内容から、`/path` 表記・`\n` 改行・ラベル記法が Mermaid 実装差分に引っかかっていた。

## 実施内容

- `docs/architecture.md` の Mermaid 記法を互換性重視で修正。
  - ノードラベルを原則 `"..."` で明示。
  - パス系ラベル（`/learn` など）を文字列ノードに変更。
  - 改行は `\n` ではなく `<br/>` を使用。
  - 点線ラベル記法を `-. "optional" .->` に統一。

## 検証結果

- 依頼で指摘のあった「アプリ内部アーキテクチャ」「ビルド/デプロイアーキテクチャ」図のパース失敗要因を除去。
- `npm run lint` 実行: 成功
- `npm run check:data` 実行: 成功

## 変更ファイル

- `docs/architecture.md`
- `denkotsu/docs/dev-log/074-mermaid-render-compatibility-fix.md`
