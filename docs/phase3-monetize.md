# Phase 3: マネタイズ 実装仕様書

## 概要

- **目的**: 無料ユーザーを維持しつつ、持続可能な収益基盤を構築
- **前提**: Phase 2 が完了し、認証・同期が動作している
- **追加技術**: Stripe (決済), Google AdSense (広告)

---

## 3-1. プラン設計

### プラン一覧

| | 無料プラン | プレミアムプラン | 合格保証パック |
|---|---|---|---|
| 価格 | 0円 | 月額480円 (税込) | 買い切り2,980円 (税込) |
| 1日の問題数 | 10問 | 無制限 | 無制限 |
| 出題形式 | 4択のみ | 全形式 | 全形式 |
| 合格力メーター | ✅ | ✅ | ✅ |
| 分野別詳細分析 | ❌ | ✅ | ✅ |
| 過去問モード (年度別) | ❌ | ✅ | ✅ |
| コレクション | ❌ | ✅ | ✅ |
| 広告 | あり | なし | なし |
| 技能試験対策 | ❌ | ❌ | ✅ (Phase 4以降) |
| 不合格時延長 | — | — | ✅ 次回試験まで無料 |

### 無料→有料の制限実装

```typescript
/** ユーザーのプラン状態 */
export interface UserPlan {
  type: "free" | "premium" | "guarantee"
  /** premium の場合: Stripe subscription ID */
  stripeSubscriptionId?: string
  /** guarantee の場合: 購入日 */
  purchasedAt?: number
  /** 今日解いた問題数 (無料プラン用) */
  todayAnswerCount: number
  /** 今日の日付 (YYYY-MM-DD) */
  todayDate: string
}

/** 問題を解けるかチェック */
export function canAnswer(plan: UserPlan): boolean {
  if (plan.type !== "free") return true
  return plan.todayAnswerCount < 10
}
```

**制限到達時のUI:**

```
┌──────────────────────────────┐
│                              │
│  今日の無料分は終わりです     │
│  (10/10問)                   │
│                              │
│  また明日来てね！             │
│  ── または ──                │
│                              │
│  ┌────────────────────┐     │
│  │ プレミアムで制限解除 │     │  ← CTA ボタン
│  │  月額480円          │     │     bg-blue-600, 白文字
│  └────────────────────┘     │
│                              │
│  ┌────────────────────┐     │
│  │ 合格保証パック      │     │  ← サブ CTA
│  │  買い切り2,980円    │     │     bg-white, border
│  └────────────────────┘     │
│                              │
│  明日0:00にリセットされます   │
│                              │
└──────────────────────────────┘
```

**制限の設計意図:**
- 10問/日 = トイレ2回分。「もう少し解きたい」と思わせるちょうどいいライン
- 制限はゲスト/ログイン問わず適用（ログインしないと回避できるバグを防ぐ）
- 無料でもゲストでも合格力は見えるようにする（モチベーション維持）

---

## 3-2. Stripe 決済連携

### アーキテクチャ

```
ブラウザ                Cloudflare Workers          Stripe
┌────────┐            ┌──────────────┐           ┌────────┐
│購入ボタン│──→ POST ──│/api/checkout │──→ API ──│Session │
│        │            │  /create     │           │作成    │
└────────┘            └──────────────┘           └────────┘
    ↓                                                │
 Stripe Checkout                                     │
 (Stripeがホストする                                  │
  決済画面にリダイレクト)                              │
    ↓                                                │
 決済完了                                            │
    ↓                                                ↓
┌────────┐            ┌──────────────┐           ┌────────┐
│成功URL │←─ redirect │/api/checkout │←─ Webhook│payment │
│に遷移  │            │  /webhook    │           │完了通知│
└────────┘            └──────────────┘           └────────┘
                            │
                     D1に課金状態を保存
```

### Stripe Products 設定

```
Product 1: デンコツ プレミアム
  - Price: ¥480/月 (recurring, monthly)
  - Stripe Price ID: price_premium_monthly

Product 2: デンコツ 合格保証パック
  - Price: ¥2,980 (one_time)
  - Stripe Price ID: price_guarantee_onetime
```

### API エンドポイント

```typescript
// POST /api/checkout/create
// → Stripe Checkout Session を作成し、URLを返す
interface CheckoutRequest {
  priceId: "price_premium_monthly" | "price_guarantee_onetime"
}
interface CheckoutResponse {
  url: string  // Stripe Checkout のURL
}

// POST /api/checkout/webhook
// → Stripe Webhook を処理し、D1のユーザープラン情報を更新
// Webhook Events:
//   checkout.session.completed → プラン有効化
//   customer.subscription.deleted → プレミアム解約
//   invoice.payment_failed → 支払い失敗通知
```

### DB スキーマ追加

```sql
CREATE TABLE user_plans (
  user_id TEXT PRIMARY KEY,
  plan_type TEXT NOT NULL DEFAULT 'free',  -- "free" | "premium" | "guarantee"
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  purchased_at INTEGER,
  expires_at INTEGER,                       -- premium: 次回請求日, guarantee: NULL (永久)
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### 解約フロー

```
設定画面
  └── プラン管理
       ├── 現在のプラン: プレミアム (月額480円)
       ├── 次回請求日: 2026/03/16
       └── [プランを解約] ← タップ
            ↓
         確認ダイアログ:
         「解約すると次回請求日以降、無料プランに戻ります。
          学習データは保持されます。」
         [解約する] [キャンセル]
            ↓ (解約する)
         Stripe API: subscription.cancel (期間満了時に終了)
            ↓
         「解約しました。〇月〇日までプレミアムをご利用いただけます。」
```

---

## 3-3. 広告実装

### 広告の種類と配置

| 種類 | 配置 | 表示頻度 | サイズ |
|---|---|---|---|
| バナー広告 | セッション完了画面の下部 | 毎回 | 320×50 |
| インタースティシャル | 問題5問ごとの切り替え時 | 5問に1回 | 全画面 |

**無料ユーザーのみ**。プレミアム/合格保証パックは広告なし。

### 広告表示のルール

```
表示条件:
  1. ユーザーが無料プランである
  2. 問題を5問解いた直後（5問目の正誤フィードバック後）
  3. 「もう1問」をタップした時に、次の問題の前にインタースティシャル
  4. セッション完了画面にバナー

表示しない条件:
  1. プレミアム/合格保証パックユーザー
  2. 初回利用時（最初の10問は広告なし。体験を邪魔しない）
  3. 連続正解中（正解の流れを止めない。連続正解が途切れた直後に表示）
```

### 実装

```typescript
// Google AdSense のスクリプトタグを動的に挿入
// (プレミアムユーザーには一切読み込まない → パフォーマンス向上)

export function shouldShowAd(plan: UserPlan, sessionStats: SessionStats): boolean {
  if (plan.type !== "free") return false
  if (sessionStats.totalAnswered <= 10 && sessionStats.isFirstSession) return false
  if (sessionStats.currentStreak > 0) return false
  return sessionStats.totalAnswered % 5 === 0
}
```

---

## 3-4. アフィリエイト

### 設置場所

設定画面内に「おすすめアイテム」セクションを配置。学習の邪魔にならない場所。

```
┌──────────────────────────────┐
│  設定                         │
│──────────────────────────────│
│  ...                         │
│  ── 試験対策グッズ ──        │
│                              │
│  ┌──────────────────────┐   │
│  │ [画像] HOZAN DK-28    │   │
│  │ 電気工事士技能試験     │   │
│  │ 工具セット             │   │
│  │ Amazonで見る →         │   │  ← アフィリエイトリンク
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ [画像] 技能試験用     │   │
│  │ ケーブルセット         │   │
│  │ Amazonで見る →         │   │
│  └──────────────────────┘   │
│                              │
└──────────────────────────────┘
```

### 表示タイミング

- 合格力が60%を超えた時: 「筆記試験の合格が近いです！技能試験の準備も始めませんか？」
- 技能試験対策セクション（Phase 4）内
- 設定画面の下部（常時）

### アフィリエイトリンクの管理

```json
// src/data/affiliates.json
[
  {
    "id": "hozan-dk28",
    "name": "HOZAN DK-28 電気工事士技能試験 工具セット",
    "url": "https://www.amazon.co.jp/dp/XXXXXXXXXX?tag=denkotsu-22",
    "image": "/images/affiliates/hozan-dk28.webp",
    "showWhen": "pass_power_above_60"
  }
]
```

---

## 3-5. 過去問モード (プレミアム機能)

### 仕様

プレミアム限定で、年度・期を指定して過去問を解けるモード。

```
┌──────────────────────────────┐
│  過去問モード      🔒プレミアム│
│──────────────────────────────│
│                              │
│  年度を選択:                  │
│  ┌────┐ ┌────┐ ┌────┐     │
│  │2024│ │2023│ │2022│ ... │
│  └────┘ └────┘ └────┘     │
│                              │
│  期を選択:                   │
│  ┌────────┐ ┌────────┐    │
│  │ 上期   │ │ 下期   │    │
│  └────────┘ └────────┘    │
│                              │
│  2024年 上期 (50問)           │
│  ┌────────────────────┐    │
│  │   挑戦する           │    │
│  └────────────────────┘    │
│                              │
│  過去の成績:                 │
│  2024上: 42/50 (84%) ✓合格  │
│  2023下: 38/50 (76%) ✓合格  │
│  2023上: 未挑戦              │
│                              │
└──────────────────────────────┘
```

**ルール:**
- 50問を一気に解く (タイマーなし)
- 途中中断・再開可能
- 合格ライン: 60% (30/50問) 以上で「合格」表示
- 年度別の成績履歴を保存

---

## 完了条件

1. **無料プラン制限**: 1日10問の制限が正しく動作する。日付が変わるとリセットされる
2. **Stripe 決済**: プレミアム(月額)と合格保証パック(買い切り)の購入が完了し、制限が解除される
3. **解約**: プレミアムの解約が正しく動作し、期限切れ後に無料プランに戻る
4. **広告**: 無料ユーザーにのみ広告が表示され、有料ユーザーには表示されない
5. **過去問モード**: 年度・期を選んで50問連続で解ける（プレミアム限定）
6. **アフィリエイト**: 設定画面にリンクが表示され、クリックでAmazonに遷移する
