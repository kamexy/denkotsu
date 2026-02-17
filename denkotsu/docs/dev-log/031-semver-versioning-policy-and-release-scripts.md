# 031 SemVer Versioning Policy And Release Scripts

- 日付: 2026-02-17

## 依頼/背景
- バージョン番号を都度手動で決めるのではなく、明確なルールで運用したい。
- `SemVer + Conventional Commits` の方針を運用に定着させる必要がある。

## 実施内容
- リポジトリ運用ルール（`AGENTS.md`）にバージョン運用ルールを追加。
  - `fix:` → patch
  - `feat:` → minor
  - `feat!:` / `BREAKING CHANGE:` → major
  - `docs/chore/ci/test` は原則バージョン更新なし
- `denkotsu/package.json` にリリース用スクリプトを追加。
  - `release:patch`
  - `release:minor`
  - `release:major`
- `denkotsu/README.md` にバージョニング方針とリリース手順を追記。

## 検証結果
- `npm run lint`（`denkotsu`）: 成功
- `npm run check:data`（`denkotsu`）: 成功
- `npm run build`（`denkotsu`）: 成功

## 変更ファイル
- `AGENTS.md`
- `denkotsu/package.json`
- `denkotsu/README.md`
- `denkotsu/docs/dev-log/031-semver-versioning-policy-and-release-scripts.md`
