# Phase 3: マネタイズ（広告・アフィリエイト）実装仕様書

## 概要

- **目的**: 全機能無料を維持しつつ、持続可能な収益基盤を構築する
- **前提**: Phase 1 が公開済みで、主要導線（クイズ/要点/成績/設定）が稼働している
- **追加技術**: Google AdSense（広告）, Amazonアソシエイト（物販）, GA4（計測）

---

## 3-1. 収益方針（確定）

### 方針

- アプリ機能は **すべて無料** で提供する
- 有料プラン、サブスク、買い切り課金は実装しない
- 収益は以下の2本柱で構成する
  - **広告収益**（Google AdSense）
  - **アフィリエイト収益**（Amazonアソシエイト）

### 非採用

- Stripe Checkout
- サブスクリプション管理
- プラン別アクセス制御
- 日次問題数の有料解除導線

---

## 3-2. 広告実装（AdSense）

### 配置方針

学習導線を遮らない「下部・区切り位置」に限定して表示する。

| 配置 | 実装場所 | 目的 |
|---|---|---|
| セッション完了画面下 | `SessionComplete` | 学習完了後の自然な表示 |
| 要点画面 | カテゴリタブ下 | 回遊中の表示機会確保 |
| 成績画面 | サマリメッセージ下 | 観測頻度の高い導線で表示 |
| 設定画面 | データセクション下 | 邪魔にならない常設枠 |

### 表示ルール

- 初回学習体験を阻害しないため、表示開始は最小回答数で制御
- 環境変数未設定時は広告を表示しない（安全側）
- プレビュー環境ではプレースホルダー表示でUI確認可能

### 主要環境変数

- `NEXT_PUBLIC_ADSENSE_ENABLED`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE`
- `NEXT_PUBLIC_ADSENSE_SLOT_LEARN`
- `NEXT_PUBLIC_ADSENSE_SLOT_STATS`
- `NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS`
- `NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS`
- `NEXT_PUBLIC_ADS_PREVIEW`

---

## 3-3. アフィリエイト実装

### 配置

- 設定画面に「試験対策グッズ」セクションを常設
- 学習体験を止めないよう、メイン導線の下部に配置

### リンク方針

- Amazon URL にアソシエイトタグを付与して遷移
- タグ形式は `xxxxx-22`
- タグ未設定時は既定値を使用（運用中に環境変数で差し替え可能）

### クリック計測

- `sponsored_tool_click` イベントを送信
- 送信先は以下を優先
  - `gtag`（GA4）
  - `plausible` / `sa_event`（存在時）
  - 任意の外部エンドポイント（`NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT`）

---

## 3-4. 計測とKPI

### 計測イベント

- `ad_slot_rendered`
- `ad_slot_interaction`
- `sponsored_tool_click`

### KPI（Phase 3）

- 広告表示可能セッション率
- 広告インタラクション率（placement別）
- アフィリエイトクリック率
- 学習体験維持（セッション時間、離脱率、再訪率の悪化がないこと）

### 品質ゲート

- `npm run check:monetization` で環境変数形式を検証
- `public/ads.txt` と `client_id` の整合を検証

---

## 3-5. 運用フロー

1. AdSense審査完了前
   - `NEXT_PUBLIC_ADS_PREVIEW=1` でUI確認
   - クリック計測・導線計測を先行検証
2. AdSense審査通過後
   - 本番`client_id`/`slot`をSecretsへ設定
   - デプロイ後に実広告表示を確認
3. 改善運用
   - placement別CTRを見て配置・文言を調整
   - 学習体験が悪化する施策は採用しない

---

## 完了条件

1. **全機能無料**: 課金導線・有料プラン依存ロジックが存在しない
2. **広告表示**: 4配置でAdSense（またはプレビュー）が正常表示される
3. **計測**: 広告/アフィリエイトの主要イベントが取得できる
4. **アフィリエイト**: 設定画面のリンクから正しく遷移できる
5. **品質**: `lint` / `check:data` / `build` / `check:monetization` が通過する
