# AGENTS.md

このファイルは、このリポジトリで作業するすべてのエージェント（Codex / Claude Code）向けの共通運用ルールです。

## 基本方針
- ユーザーへの回答は、日本語で簡潔かつ丁寧に行う。
- 既存の仕様書（`docs/SPEC.md`）と実装整合性を常に意識する。

## 変更時の必須ルール
- コードやドキュメントに変更を加えたら、必ず `denkotsu/docs/dev-log/` に dev-log を1件追加する。
- dev-log のファイル名は `NNN-<kebab-case>.md` 形式（3桁連番）とする。
- dev-log には最低限以下を記載する。
  - 日付
  - 依頼/背景
  - 実施内容
  - 検証結果
  - 変更ファイル

## Git運用ルール
- 変更後は、適切な粒度で必ず git コミットする。
- 原則として「1コミット1目的」を守る。
- コミットメッセージは Conventional Commits を推奨（`feat:`, `fix:`, `docs:`, `chore:` など）。
- dev-log は対応する実装コミットに含める。
- ユーザーが明示的に指示しない限り、履歴改変（rebase/squash/amend）は行わない。

## バージョン運用ルール（SemVer）
- アプリバージョンは `denkotsu/package.json` の `version` を正とする。
- Conventional Commits に基づき、次の粒度でバージョンを上げる。
  - `fix:` は `patch`（例: `0.1.0` → `0.1.1`）
  - `feat:` は `minor`（例: `0.1.0` → `0.2.0`）
  - `feat!:` または `BREAKING CHANGE:` は `major`（例: `0.1.0` → `1.0.0`）
- `docs:` / `chore:` / `ci:` / `test:` は原則バージョンを上げない。
- エージェントが `fix:` / `feat:` / `feat!:` でコミットする際は、コミット前に必ず `denkotsu` で `npm version patch|minor|major --no-git-tag-version` を実行し、`package.json` と `package-lock.json` を同コミットに含める。
- リリース時にタグを付与する場合は、別途 `npm version patch|minor|major` を実行して `vX.Y.Z` を作成する。

## UI変更時の承認フロー
- UIに変更を入れた場合は、コミット前にローカルで画面確認を行う。
- スクリーンショット共有は必須としない（ユーザーがローカルアクセスで確認する運用を優先）。
- UI確認結果をユーザーに提示し、承認を得るまで `git commit` / `git push` / デプロイを実行しない。

## 品質確認ルール
- コミット前に最低限、対象プロジェクト（`denkotsu`）で次を実行する。
  - `npm run lint`
  - `npm run check:data`
- ビルドに影響する変更を含む場合は、追加で `npm run build` を実行する。
