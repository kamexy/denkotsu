# 041 Monetization Click Telemetry Foundation

- 日付: 2026-02-19

## 依頼/背景
- 収益化の次ステップとして、広告/スポンサーリンク導線のクリック計測を入れたい。
- どの枠が押されたかを後から分析できるようにしたい。

## 実施内容
- 収益導線イベント計測の基盤を追加。
  - `src/lib/telemetry.ts`
  - 計測イベント:
    - `sponsored_tool_click`（設定画面のスポンサーリンク押下）
    - `ad_slot_rendered`（セッション完了広告枠の表示）
    - `ad_slot_interaction`（セッション完了広告枠の操作）
  - 送信先:
    - 既知分析関数があれば送信（`gtag` / `plausible` / `sa_event`）
    - `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT` が設定されていれば `sendBeacon` / `fetch(keepalive)` でPOST
- スポンサーリンク押下計測を追加。
  - `TrackedExternalLink` を新規作成し、設定画面の推奨グッズリンクに適用。
- セッション完了広告枠の表示/操作計測を追加。
  - `AdSlot` で枠表示時に `ad_slot_rendered` を送信。
  - 広告枠操作時に `ad_slot_interaction` を送信。
- 収益化設定検証にテレメトリエンドポイント検証を追加。
  - `NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT` の http(s) URL 形式チェック。
- CSP `connect-src` にテレメトリ送信先オリジンを動的追加。
- README にテレメトリ環境変数を追記。
- `feat` ルールに従い、アプリバージョンを `0.3.0` から `0.4.0` に更新。

## 検証結果
- `npm run lint` 成功
- `npm run check:data` 成功
- `npm run check:monetization` 成功
- `npm run build` 成功

## 変更ファイル
- `denkotsu/package.json`
- `denkotsu/package-lock.json`
- `denkotsu/README.md`
- `denkotsu/scripts/validate-monetization-env.mjs`
- `denkotsu/src/app/layout.tsx`
- `denkotsu/src/components/ads/AdSlot.tsx`
- `denkotsu/src/components/monetization/RecommendedToolsSection.tsx`
- `denkotsu/src/components/monetization/TrackedExternalLink.tsx`
- `denkotsu/src/lib/telemetry.ts`
- `denkotsu/docs/dev-log/041-monetization-click-telemetry-foundation.md`
