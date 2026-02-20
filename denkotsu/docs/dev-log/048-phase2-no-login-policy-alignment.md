# 048 Phase2 No Login Policy Alignment

- 日付: 2026-02-20

## 依頼/背景
- 方針変更により、アプリは「全機能無料・ログインなし・広告中心」で運用することが確定。
- 既存の設計ドキュメントに残っていた「Google/Appleログイン前提」の記述を解消し、実装方針と一致させる必要があった。

## 実施内容
- `docs/phase2-engagement.md` を全面更新し、Phase 2 を「同期コード方式のクラウド同期 + 復習強化 + エンゲージメント機能」へ再定義。
- `docs/SPEC.md` を更新し、以下を修正。
  - UX原則のログイン前提を削除（ログイン不要）
  - Phase 2 技術スタックから認証基盤を削除し、同期コード方式へ変更
  - Phase 2 ロードマップ項目をログイン前提から同期コード前提へ変更
  - データモデルの `user_id` を `profile_id`（ローカル/同期コード由来）へ変更
- `docs/phase1-mvp.md` のスコープ外表を更新し、ログインは採用しない方針を明記。
- `cloudflare/sync-worker/README.md` の注意事項を更新し、OAuth追加前提の文言を現行方針に合わせて修正。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- 主要設計ドキュメント上でログイン前提の実装指示が解消されたことを確認

## 変更ファイル
- `docs/phase2-engagement.md`
- `docs/SPEC.md`
- `docs/phase1-mvp.md`
- `cloudflare/sync-worker/README.md`
- `denkotsu/docs/dev-log/048-phase2-no-login-policy-alignment.md`
