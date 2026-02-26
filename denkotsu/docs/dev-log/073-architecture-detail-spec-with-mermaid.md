# 073 architecture-detail-spec-with-mermaid

- 日付: 2026-02-26

## 依頼/背景

- 「アーキテクチャがわかる詳細仕様ドキュメントがあるか確認したい。Mermaid図もほしい」という依頼。
- 既存の `docs/SPEC.md` には概略はあるが、実装ファイルに対応した専用アーキテクチャ仕様が不足していた。

## 実施内容

1. `docs/architecture.md` を新規作成。
   - システム全体構成（Pages / Worker / D1 / GA / AdSense）
   - アプリ内部構成（app/components/hooks/lib/data）
   - 主要フロー（回答処理、起動時同期）
   - CI/CD 構成（GitHub Actions → Cloudflare Pages）
   を Mermaid で図示。
2. `denkotsu/README.md` に仕様ドキュメント導線を追加。
   - `docs/architecture.md` への参照を明記。

## 検証結果

- `npm run lint` 実行: 成功
- `npm run check:data` 実行: 成功
- ドキュメント変更のみのため、ビルド影響なし（実行不要）

## 変更ファイル

- `docs/architecture.md` (新規)
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/073-architecture-detail-spec-with-mermaid.md` (本ファイル)
