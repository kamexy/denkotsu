# 047 Free Monetization Policy Doc Alignment

- 日付: 2026-02-20

## 依頼/背景
- 有料プラン（サブスク/買い切り）を廃止し、全機能無料で提供する方針へ変更。
- 収益化は広告（AdSense）とアフィリエイトのみに統一する必要がある。
- 途中作業で追加した未コミットファイルがあれば巻き戻し、設計ドキュメント全体を整合させる。

## 実施内容
- 未コミットで追加されていた `denkotsu/src/lib/plan.ts` を削除し、途中変更を巻き戻し。
- `docs/phase3-monetize.md` を全面更新し、以下を明確化。
  - 全機能無料
  - 課金/有料プラン/Stripeを非採用
  - AdSense + Amazonアソシエイト + GA4計測を中心とする運用
- `docs/SPEC.md` のマネタイズ前提を広告中心へ更新。
  - 課金モデル記述を削除
  - 収益予測・ロードマップ・KPIを広告/アフィリエイト中心に修正
  - Phase 4 を全ユーザー提供前提に修正
- `docs/phase4-practical.md` の課金前提（合格保証購入者限定）を削除し、全ユーザー提供へ修正。
- `docs/phase1-mvp.md` のスコープ外表を最新方針（有料課金は採用しない）へ更新。

## 検証結果
- ドキュメント差分を確認し、課金前提が設計方針上で残らないよう整理。
- 未コミットの途中コード追加が残っていないことを確認。

## 変更ファイル
- `docs/phase1-mvp.md`
- `docs/phase3-monetize.md`
- `docs/phase4-practical.md`
- `docs/SPEC.md`
- `denkotsu/docs/dev-log/047-free-monetization-policy-doc-alignment.md`
