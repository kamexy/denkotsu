# Phase 1: MVP 実装仕様書

## 概要

- **目的**: 「アプリを開く→即クイズ→合格力が見える」の体験を最短で実現
- **スコープ**: 4択クイズ + 合格力メーター + PWA。それ以外はすべてPhase 2以降
- **技術**: Next.js 15 (Static Export) + IndexedDB + Cloudflare Pages
- **問題数**: 100問（6分野×約17問）でリリース

---

## ディレクトリ構成

```
denkotsu/
├── public/
│   ├── manifest.json           # PWA マニフェスト
│   ├── sw.js                   # Service Worker
│   ├── icons/                  # PWA アイコン (192x192, 512x512)
│   ├── images/
│   │   └── questions/          # 問題用画像 (webp, 最大200KB/枚)
│   └── sounds/
│       ├── correct.mp3         # 正解SE (1秒以内, 50KB以下)
│       └── incorrect.mp3       # 不正解SE (1秒以内, 50KB以下)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト (メタデータ, フォント, PWA)
│   │   ├── page.tsx            # ホーム画面 (= クイズ画面)
│   │   ├── stats/
│   │   │   └── page.tsx        # 学習統計画面
│   │   └── settings/
│   │       └── page.tsx        # 設定画面
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuizCard.tsx        # 問題カード (問題文+選択肢)
│   │   │   ├── QuizResult.tsx      # 正誤フィードバック + 解説
│   │   │   ├── OptionButton.tsx    # 選択肢ボタン
│   │   │   └── SessionComplete.tsx # セッション完了画面
│   │   ├── stats/
│   │   │   ├── PassPowerMeter.tsx  # 合格力メーター (メイン)
│   │   │   └── CategoryBar.tsx     # 分野別バー
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx       # 下部ナビゲーション
│   │   │   └── Header.tsx          # ヘッダー (合格力サマリー)
│   │   └── common/
│   │       ├── ProgressRing.tsx    # 円形プログレス (SVG)
│   │       └── AnimatedNumber.tsx  # 数値アニメーション
│   ├── lib/
│   │   ├── db.ts               # IndexedDB 操作 (Dexie.js ラッパー)
│   │   ├── quiz-engine.ts      # 出題アルゴリズム
│   │   ├── pass-power.ts       # 合格力計算
│   │   └── questions.ts        # 問題データ読み込み
│   ├── data/
│   │   └── questions.json      # 問題データ (100問)
│   ├── types/
│   │   └── index.ts            # 型定義
│   └── hooks/
│       ├── useQuiz.ts          # クイズ状態管理
│       └── usePassPower.ts     # 合格力取得
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 型定義 (`src/types/index.ts`)

```typescript
/** 問題の分野 */
export type Category =
  | "electrical_theory"    // 電気理論
  | "wiring_diagram"       // 配線図
  | "laws"                 // 法規
  | "construction_method"  // 工事方法
  | "equipment_material"   // 器具・材料
  | "inspection"           // 検査・測定

/** 分野の日本語ラベル */
export const CATEGORY_LABELS: Record<Category, string> = {
  electrical_theory: "電気理論",
  wiring_diagram: "配線図",
  laws: "法規",
  construction_method: "工事方法",
  equipment_material: "器具・材料",
  inspection: "検査・測定",
}

/** 問題データ (questions.json の1要素) */
export interface Question {
  id: string                    // "q001" 形式
  category: Category
  question: string              // 問題文
  image?: string                // 画像パス (例: "/images/questions/q001.webp")
  options: [string, string, string, string]  // 選択肢 (必ず4つ)
  correctIndex: number          // 正解のインデックス (0-3)
  explanation: string           // 解説 (3行以内、100文字以内を目標)
  examYear?: number             // 出典年度
  examSession?: "upper" | "lower"  // 上期/下期
}

/** ユーザーの回答記録 (IndexedDB に保存) */
export interface AnswerRecord {
  id?: number                   // auto increment
  questionId: string
  isCorrect: boolean
  answeredAt: number            // Date.now()
  timeSpentMs: number           // 回答にかかった時間
}

/** 忘却曲線データ (IndexedDB に保存) */
export interface SpacedRepetition {
  questionId: string            // primary key
  easeFactor: number            // 初期値 2.5
  intervalDays: number          // 初期値 0
  nextReviewAt: number          // 次回出題日時 (Date.now() 形式)
  repetitionCount: number       // 復習回数
  lastAnsweredAt: number        // 最後に回答した日時
}

/** 合格力データ */
export interface PassPower {
  overall: number               // 総合合格力 (0-100)
  byCategory: Record<Category, number>  // 分野別 (0-100)
  totalAnswered: number         // 総回答数
  lastUpdated: number           // 最終更新日時
}
```

---

## 問題データ形式 (`src/data/questions.json`)

Phase 1 では100問を静的JSONとして同梱する。

```json
[
  {
    "id": "q001",
    "category": "electrical_theory",
    "question": "100Vの電圧を加えたとき、5Aの電流が流れた。この回路の抵抗値[Ω]は？",
    "options": ["10", "20", "50", "500"],
    "correctIndex": 1,
    "explanation": "オームの法則 V=IR より、R=V/I=100/5=20Ω",
    "examYear": 2024,
    "examSession": "upper"
  },
  {
    "id": "q002",
    "category": "equipment_material",
    "question": "写真に示す器具の名称は？",
    "image": "/images/questions/q002.webp",
    "options": ["埋込連用タンブラスイッチ", "位置表示灯内蔵スイッチ", "確認表示灯内蔵スイッチ", "埋込連用コンセント"],
    "correctIndex": 0,
    "explanation": "レバー式の構造が特徴。壁に埋め込んで使用する一般的なスイッチ。"
  }
]
```

**制約:**
- 問題文: 200文字以内
- 選択肢: 各50文字以内
- 解説: 100文字以内（3行以内に収める）
- 画像: WebP形式、幅800px以下、200KB以下
- 各分野最低15問以上、偏りがないようにする

**Phase 1 の問題数配分:**

| 分野 | 問題数 | 試験での出題比率 |
|---|---|---|
| 電気理論 | 17問 | 約16% |
| 配線図 | 17問 | 約20% |
| 法規 | 17問 | 約16% |
| 工事方法 | 17問 | 約20% |
| 器具・材料 | 16問 | 約16% |
| 検査・測定 | 16問 | 約12% |
| **合計** | **100問** | |

---

## IndexedDB スキーマ (`src/lib/db.ts`)

Dexie.js を使用。ライブラリサイズ約16KBで、IndexedDB の複雑なAPIを簡潔に扱える。

```typescript
import Dexie, { type Table } from "dexie"
import type { AnswerRecord, SpacedRepetition } from "@/types"

export class DenkotsuDB extends Dexie {
  answers!: Table<AnswerRecord>
  spacedRepetition!: Table<SpacedRepetition>

  constructor() {
    super("denkotsu")
    this.version(1).stores({
      answers: "++id, questionId, answeredAt",
      spacedRepetition: "questionId",
    })
  }
}

export const db = new DenkotsuDB()
```

**データ容量の見積もり:**
- AnswerRecord: 約100バイト/件 × 1日20問 × 365日 = 約730KB/年
- SpacedRepetition: 約80バイト/問 × 600問 = 約48KB
- **合計: 1年使っても1MB以下。IndexedDBの上限(通常50MB〜)に対して余裕。**

---

## 出題アルゴリズム (`src/lib/quiz-engine.ts`)

### Phase 1 のアルゴリズム (簡易版)

Phase 1 では完全なSM-2アルゴリズムは不要。以下のシンプルなルールで出題する。

```typescript
/**
 * 出題する問題を1問選ぶ
 *
 * 優先度:
 * 1. まだ一度も解いていない問題 (ランダム)
 * 2. 過去に間違えた問題 (間違えた回数が多い順)
 * 3. 最後に解いてから時間が経った問題 (古い順)
 */
export async function selectNextQuestion(
  allQuestions: Question[],
): Promise<Question>
```

**選択ロジックの詳細:**

```
Step 1: 未回答の問題があるか？
  → ある場合: 分野バランスを考慮してランダムに1問選ぶ
     (最も問題数が少ない分野から優先的に出題)

Step 2: 全問回答済みの場合、間違えた問題があるか？
  → ある場合: 間違えた回数が多い問題のうち、
     最後に解いてから最も時間が経った問題を選ぶ

Step 3: すべて正解済みの場合
  → 最後に解いてから最も時間が経った問題を選ぶ
     (忘却曲線の簡易版: 時間経過による復習)
```

**分野バランスの制御:**
- 直近10問で同じ分野が3問以上出ないようにする
- 合格力が低い分野の出題確率を上げる（重み付け: 合格力の低い分野は2倍の確率）

---

## 合格力計算 (`src/lib/pass-power.ts`)

### 計算式

```typescript
/**
 * 合格力を計算する (0〜100)
 *
 * 各分野の合格力 = 正答率 × 回答カバー率 × 時間減衰係数
 * 全体の合格力 = 各分野の合格力の加重平均 (試験の出題比率で重み付け)
 */
export async function calculatePassPower(): Promise<PassPower>
```

**各分野の合格力:**

```
分野別合格力 = 正答率 × カバー率 × 時間減衰

正答率:
  その分野で正解した回数 / その分野で回答した回数
  ※ 直近30日間の回答のみ対象
  ※ 同じ問題は最新の回答のみカウント

カバー率:
  その分野で1回以上解いた問題数 / その分野の全問題数
  ※ 全問解いていないと100%にならないようにする

時間減衰:
  最後にその分野を解いた日からの経過日数に応じて減衰
  0日: 1.0
  7日: 0.9
  14日: 0.8
  30日: 0.6
  60日以上: 0.4
  ※ 「久しぶりに開いたら合格力が下がっている」→ 復習を促す効果
```

**全体の合格力:**

```
全体 = Σ(分野別合格力 × 出題比率) / Σ出題比率

出題比率 (試験での配点比率):
  電気理論:    16%
  配線図:      20%
  法規:        16%
  工事方法:    20%
  器具・材料:  16%
  検査・測定:  12%
```

**表示ルール:**
- 0〜29%: 「まだまだこれから」 (テキスト赤)
- 30〜59%: 「順調に成長中」 (テキスト黄)
- 60〜79%: 「合格が見えてきた！」 (テキスト青)
- 80〜100%: 「合格圏内！」 (テキスト緑)

---

## 画面仕様

### 画面1: ホーム画面 (= クイズ画面) — `src/app/page.tsx`

**アプリの起動直後に表示される画面。即座に問題が出る。**

#### 状態遷移

```
[起動]
  ↓
[問題表示] ← ─ ─ ─ ─ ─ ┐
  ↓ (選択肢をタップ)     │
[正誤フィードバック]      │
  ↓ (自動 or タップ)     │
  ├── [もう1問] ─ ─ ─ ─ ┘
  └── [今日はここまで]
        ↓
      [セッション完了]
```

#### 問題表示状態

```
┌──────────────────────────────┐
│  ⚡ 合格力 42%    Q.15/100   │  ← Header: 合格力 + 進捗
│──────────────────────────────│
│                              │
│  ┌──────────────────────┐   │
│  │   [問題画像]          │   │  ← 画像がある場合のみ表示
│  │   (最大高さ200px)     │   │
│  └──────────────────────┘   │
│                              │
│  Q. 100Vの電圧を加えたとき、│  ← 問題文
│  5Aの電流が流れた。          │     フォント: 16px, font-medium
│  この回路の抵抗値[Ω]は？    │
│                              │
│  ┌──────────────────────┐   │
│  │  ① 10               │   │  ← 選択肢ボタン
│  └──────────────────────┘   │     高さ: 56px
│  ┌──────────────────────┐   │     角丸: 12px
│  │  ② 20               │   │     タップ領域: 幅100%
│  └──────────────────────┘   │     間隔: 12px
│  ┌──────────────────────┐   │
│  │  ③ 50               │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │  ④ 500              │   │
│  └──────────────────────┘   │
│                              │
│──────────────────────────────│
│  📊 学習    🏠 ホーム  ⚙ 設定│  ← BottomNav (固定)
└──────────────────────────────┘
```

**選択肢ボタンの仕様:**
- 未選択: `bg-white border border-gray-200`
- ホバー: `bg-gray-50`
- 選択後(正解): `bg-emerald-50 border-emerald-500` + ✓アイコン
- 選択後(不正解): `bg-red-50 border-red-500` + ✗アイコン
- 選択後(正解表示): 正解の選択肢が `bg-emerald-50 border-emerald-500` に変化

#### 正誤フィードバック状態

選択肢タップ後、同じ画面内で以下が表示される:

```
┌──────────────────────────────┐
│  ...問題部分は上にスクロール...│
│                              │
│  ① 10                  ✗    │  ← 不正解は赤
│  ② 20                  ✓    │  ← 正解は緑 (選んでなくても緑にする)
│  ③ 50                       │
│  ④ 500                      │
│                              │
│  ┌──────────────────────┐   │
│  │ 💡 オームの法則       │   │  ← 解説カード
│  │ V=IR より、           │   │     bg-blue-50, 角丸12px
│  │ R=V/I=100/5=20Ω     │   │     パディング: 16px
│  └──────────────────────┘   │
│                              │
│  ┌────────┐  ┌──────────┐  │
│  │もう1問 │  │ここまで  │  │  ← アクションボタン
│  └────────┘  └──────────┘  │     「もう1問」: bg-blue-600, 白文字
│                              │     「ここまで」: bg-gray-100, 灰文字
└──────────────────────────────┘
```

**フィードバックの演出:**
- 正解時: 画面上部から緑のパーティクル + バイブレーション(10ms) + 正解SE
- 不正解時: 画面が軽く横に揺れる(150ms) + バイブレーション(50ms) + 不正解SE
- 合格力が変動した場合: メーターがアニメーションで更新される (300ms ease-out)
- SE/バイブレーションは設定でOFF可能

#### セッション完了画面 (`SessionComplete.tsx`)

「ここまで」を押した時、またはエラー時に表示。

```
┌──────────────────────────────┐
│                              │
│         おつかれさま！        │  ← 24px, font-bold
│                              │
│      ⚡ 合格力 42% → 44%     │  ← 変動をアニメーション表示
│                              │
│    今日のまとめ               │
│    ├── 解いた問題: 12問      │
│    ├── 正解率: 75%           │
│    └── 新しく覚えた: 3問     │
│                              │
│   ┌────────────────────┐    │
│   │   またいつでもどうぞ  │    │  ← ボタン: ホームに戻る
│   └────────────────────┘    │
│                              │
└──────────────────────────────┘
```

**表示する文言のバリエーション (ランダム):**
- 「おつかれさま！」
- 「いい調子！」
- 「ナイスファイト！」
- 「また来てね！」
- ※ 「まだ足りない」「もっと頑張ろう」等のネガティブ表現は禁止

### 画面2: 学習統計画面 — `src/app/stats/page.tsx`

```
┌──────────────────────────────┐
│  学習のきろく                 │  ← 24px, font-bold
│──────────────────────────────│
│                              │
│    ⚡ 合格力                  │
│    ┌──────────────────┐      │
│    │                  │      │  ← ProgressRing (SVG円形)
│    │       44%        │      │     直径: 160px
│    │                  │      │     ストローク幅: 12px
│    └──────────────────┘      │
│                              │
│    分野べつ                   │
│    電気理論    ██████░░░░ 60% │  ← CategoryBar
│    配線図      ████░░░░░░ 40% │     高さ: 8px, 角丸: 4px
│    法規        ███░░░░░░░ 30% │     バーの色: 分野ごとに固定
│    工事方法    █████░░░░░ 50% │
│    器具・材料  ██████░░░░ 55% │
│    検査・測定  ████░░░░░░ 35% │
│                              │
│    これまでの学習             │
│    ├── 総回答数:    234問     │
│    ├── 総正解率:    68%       │
│    └── 学習日数:    12日      │
│                              │
│──────────────────────────────│
│  📊 学習    🏠 ホーム  ⚙ 設定│
└──────────────────────────────┘
```

**分野別バーの色:**
- 電気理論: `bg-blue-500`
- 配線図: `bg-purple-500`
- 法規: `bg-amber-500`
- 工事方法: `bg-emerald-500`
- 器具・材料: `bg-rose-500`
- 検査・測定: `bg-cyan-500`

### 画面3: 設定画面 — `src/app/settings/page.tsx`

```
┌──────────────────────────────┐
│  設定                         │
│──────────────────────────────│
│                              │
│  サウンド        [ON ○───]   │  ← Toggle, デフォルトON
│  バイブレーション [ON ○───]   │  ← Toggle, デフォルトON
│                              │
│  ── データ ──                │
│  学習データをリセット  [実行] │  ← 確認ダイアログ付き
│                              │
│  ── このアプリについて ──    │
│  バージョン          1.0.0   │
│  お問い合わせ          →     │  ← メールリンク or Google Form
│                              │
│──────────────────────────────│
│  📊 学習    🏠 ホーム  ⚙ 設定│
└──────────────────────────────┘
```

---

## PWA 設定

### manifest.json

```json
{
  "name": "デンコツ - 第二種電気工事士",
  "short_name": "デンコツ",
  "description": "スキマ時間で合格！第二種電気工事士 学習アプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker (`public/sw.js`)

**キャッシュ戦略:**
- **App Shell** (HTML/CSS/JS): Cache First — ビルド時にプリキャッシュ
- **問題データ** (questions.json): Cache First — 初回ロード時にキャッシュ
- **画像**: Cache First — 初回表示時にキャッシュ
- **API呼び出し**: Phase 1 ではAPIなし

```javascript
const CACHE_NAME = "denkotsu-v1"
const PRECACHE_URLS = [
  "/",
  "/stats",
  "/settings",
  "/data/questions.json",
]

// install: プリキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
})

// fetch: Cache First, フォールバックでネットワーク
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  )
})
```

**バージョン更新時:**
- `CACHE_NAME` のバージョンを上げる (例: `denkotsu-v2`)
- activate イベントで古いキャッシュを削除
- 問題データの更新はJSONファイルを差し替えてデプロイするだけ

---

## レスポンシブ対応

**モバイルファースト。ブレイクポイントは1つだけ。**

| 画面幅 | レイアウト |
|---|---|
| 〜768px (モバイル) | フル幅、パディング16px |
| 768px〜 (タブレット/PC) | 最大幅480px中央配置、カード型 |

PC/タブレットでもスマホアプリのような見た目になるよう、コンテンツ幅を480pxに制限する。

```tsx
// layout.tsx のメインコンテナ
<main className="mx-auto max-w-[480px] min-h-dvh bg-white">
  {children}
</main>
// 480px以上の画面では背景をグレーにしてカード感を出す
// body: bg-gray-100
```

---

## パフォーマンス要件

| 指標 | 目標値 |
|---|---|
| First Contentful Paint | 1.0秒以内 |
| Largest Contentful Paint | 1.5秒以内 |
| Time to Interactive | 1.5秒以内 |
| Cumulative Layout Shift | 0.1以下 |
| Total Bundle Size (gzip) | 150KB以下 |
| 問題表示までの時間 | 0.5秒以内 (起動後) |

**実現手段:**
- Static Export (サーバーサイドレンダリングなし)
- 問題JSONをプリキャッシュ
- 画像は遅延読み込み (`loading="lazy"`)
- Framer Motion は必要なモジュールだけ tree-shake
- フォントはシステムフォント使用 (Webフォント不使用)

---

## デプロイ設定

### Cloudflare Pages

```
ビルドコマンド:    next build
出力ディレクトリ:  out
Node.jsバージョン: 20
```

### next.config.ts

```typescript
import type { NextConfig } from "next"

const config: NextConfig = {
  output: "export",       // 静的エクスポート
  images: {
    unoptimized: true,    // Cloudflare Pages では画像最適化サーバーが使えないため
  },
}

export default config
```

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy out --project-name=denkotsu
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Phase 1 で「やらないこと」(スコープ外の明示)

以下は Phase 2 以降で対応する。Phase 1 では絶対に実装しない:

| 機能 | 理由 | 対応Phase |
|---|---|---|
| ユーザー認証/ログイン | サーバー不要で始めるため | Phase 2 |
| 端末間データ同期 | 認証が前提 | Phase 2 |
| SM-2 忘却曲線アルゴリズム | 簡易版で十分 | Phase 2 |
| コレクション/ガチャ | MVPには不要 | Phase 2 |
| 実績/アチーブメント | MVPには不要 | Phase 2 |
| ◯✕/画像タップ/並べ替え | 4択だけでMVP成立 | Phase 2 |
| 有料プラン/課金 | 採用しない（全機能無料方針） | 対応なし |
| 広告表示 | ユーザーが集まってから | Phase 3 |
| 技能試験動画 | 筆記合格がまず先 | Phase 4 |
| 複線図練習 | 筆記合格がまず先 | Phase 4 |
| ダークモード | 利便性向上だが必須ではない | 未定 |
| 多言語対応 | 日本の国家試験なので日本語のみ | 対応なし |

---

## 完了条件 (Definition of Done)

Phase 1 は以下がすべて満たされた時点で完了とする:

1. **クイズ機能**: 4択問題を連続で解ける。正誤判定と解説表示が正しく動作する
2. **合格力メーター**: 回答に基づいて合格力が計算・表示される。分野別の内訳が見える
3. **データ永続化**: ブラウザを閉じても学習履歴が消えない (IndexedDB)
4. **PWA**: ホーム画面に追加でき、オフラインでも問題が解ける
5. **問題数**: 6分野×各15問以上 = 合計100問以上が収録されている
6. **レスポンシブ**: iPhone SE (375px) 〜 iPad (768px) 〜 PC (1920px) で正常表示
7. **パフォーマンス**: Lighthouse スコア 90点以上 (Performance, Accessibility, Best Practices, PWA)
8. **Cloudflare Pages**: 本番URLでアクセスできる
