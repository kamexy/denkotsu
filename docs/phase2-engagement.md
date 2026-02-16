# Phase 2: エンゲージメント強化 実装仕様書

## 概要

- **目的**: リテンション（継続率）を高める仕組みを追加。「また開きたい」を作る
- **前提**: Phase 1 が完了し、Cloudflare Pages で公開済み
- **追加技術**: Cloudflare D1 + Workers (認証・同期), Dexie Cloud or 自前同期

---

## 2-1. ユーザー認証

### 仕様

- **認証方式**: Google ログイン / Apple ログイン の2種のみ
- **認証基盤**: Cloudflare Workers 上に自前実装 (OAuth 2.0 フロー)
- **ゲスト→ログインの移行**: ゲスト時のIndexedDBデータをクラウドにマージ

### 画面フロー

```
[ゲスト利用中]
  ↓ (設定画面 or 同期促進バナーをタップ)
[ログイン画面]
  ├── [Googleでログイン] → Google OAuth → コールバック → マージ処理
  └── [Appleでログイン]  → Apple OAuth  → コールバック → マージ処理
  ↓
[マージ確認画面]
  「ゲスト時の学習データ (234問分) をアカウントに引き継ぎますか？」
  ├── [引き継ぐ] → ローカルデータをクラウドにアップロード
  └── [新しく始める] → ローカルデータを破棄
  ↓
[完了] → 以降は自動でクラウド同期
```

### ログイン促進の仕組み

ログインを強制しない。以下のタイミングでやさしく提案する:

- 50問解いた時点で初回バナー: 「データを守るためにログインしませんか？」
- 設定画面に常時: 「ログインして端末間同期」リンク
- それ以上の催促はしない（ストレスにならないように）

### トークン管理

```
アクセストークン: httpOnly Cookie, 有効期限1時間
リフレッシュトークン: httpOnly Cookie, 有効期限30日
CSRF対策: SameSite=Strict
```

### DB スキーマ追加

```sql
-- Cloudflare D1 に作成
CREATE TABLE users (
  id TEXT PRIMARY KEY,            -- UUID v4
  provider TEXT NOT NULL,         -- "google" | "apple"
  provider_id TEXT NOT NULL,      -- プロバイダー側のユーザーID
  email TEXT,
  display_name TEXT,
  created_at INTEGER NOT NULL,    -- Unix timestamp (ms)
  last_synced_at INTEGER,
  UNIQUE(provider, provider_id)
);
```

---

## 2-2. クラウド同期

### 同期アーキテクチャ

```
ブラウザ (IndexedDB)          Cloudflare D1
┌──────────────┐             ┌──────────────┐
│ answers      │ ──push──→  │ answers      │
│ spacedRep    │ ──push──→  │ spacedRep    │
│ collections  │ ──push──→  │ collections  │
│ achievements │ ──push──→  │ achievements │
└──────────────┘             └──────────────┘
       ↑                            │
       └────────── pull ────────────┘
```

### 同期タイミング

| イベント | 動作 |
|---|---|
| アプリ起動時 | サーバーから最新データを pull |
| 問題回答後 | 回答データを push (バックグラウンド、非同期) |
| 明示的な同期ボタン押下 | 全データを双方向同期 |
| オフライン時 | ローカルにのみ書き込み。次回オンライン時に自動push |

### コンフリクト解決

```
ルール: Last-Write-Wins (タイムスタンプベース)

例: 同じ問題の SpacedRepetition がスマホとPCで異なる場合
  → lastAnsweredAt が新しい方を採用
  → answers テーブルは追記のみ (append-only) なのでコンフリクトなし
```

### API エンドポイント (Cloudflare Workers)

```
POST /api/sync/push
  Body: { answers: AnswerRecord[], spacedRepetition: SpacedRepetition[] }
  Response: { success: boolean, serverTimestamp: number }

GET /api/sync/pull?since={timestamp}
  Response: { answers: AnswerRecord[], spacedRepetition: SpacedRepetition[] }

※ 認証: Authorization ヘッダーにアクセストークン
※ すべてのデータは user_id でフィルタリング
```

---

## 2-3. SM-2 忘却曲線アルゴリズム

Phase 1 の簡易アルゴリズムを、SM-2 ベースの本格的な忘却曲線に置き換える。

### SM-2 アルゴリズムの実装

```typescript
/**
 * SM-2 アルゴリズム（SuperMemo 2 の改良版）
 *
 * 回答の質 (quality): 0-5
 *   5: 完璧に覚えている（即答）
 *   4: 少し考えて正解
 *   3: かなり考えて正解
 *   2: 不正解だが「あー、それか」と思えた
 *   1: 不正解で解説を読んでも「？」
 *   0: 完全に初見
 *
 * 本アプリでの簡略化:
 *   正解 + 5秒以内   → quality 5
 *   正解 + 5〜15秒   → quality 4
 *   正解 + 15秒以上  → quality 3
 *   不正解           → quality 1
 */
export function updateSpacedRepetition(
  current: SpacedRepetition,
  quality: number,
): SpacedRepetition {
  let { easeFactor, intervalDays, repetitionCount } = current

  if (quality >= 3) {
    // 正解
    if (repetitionCount === 0) {
      intervalDays = 1
    } else if (repetitionCount === 1) {
      intervalDays = 3
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    repetitionCount++
  } else {
    // 不正解: リセット
    repetitionCount = 0
    intervalDays = 0   // 次のセッションで再出題
  }

  // EaseFactor の更新 (最小1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  return {
    ...current,
    easeFactor,
    intervalDays,
    repetitionCount,
    nextReviewAt: Date.now() + intervalDays * 24 * 60 * 60 * 1000,
    lastAnsweredAt: Date.now(),
  }
}
```

### 出題アルゴリズムの更新

```typescript
/**
 * Phase 2 の出題アルゴリズム
 *
 * 優先度:
 * 1. nextReviewAt を過ぎている問題 (復習が必要)
 *    → 超過時間が長い順
 * 2. まだ一度も解いていない問題
 *    → 合格力が低い分野から優先
 * 3. 上記がない場合、intervalDays が最も短い問題
 *    → 定着度が低い問題を復習
 *
 * 制約:
 * - 直近10問で同じ分野が3問以上出ない
 * - 直近5問で同じ問題が出ない
 */
export async function selectNextQuestion(
  allQuestions: Question[],
): Promise<Question>
```

---

## 2-4. コレクション機能

### 仕組み

問題を解くとランダムでパーツがドロップする。

```
ドロップ条件:
  - 正解時のみ (不正解ではドロップしない)
  - ドロップ率: 30% (正解3〜4回に1個)
  - レアリティ別ドロップ率:
    - ノーマル: 70%
    - レア: 25%
    - レジェンド: 5%
```

### コレクションアイテムデータ (`src/data/collections.json`)

```json
[
  {
    "id": "item001",
    "name": "VVFケーブル",
    "rarity": "normal",
    "category": "材料",
    "description": "正式名称は「600Vビニル絶縁ビニルシースケーブル平形」。屋内配線で最も多く使われるケーブル。",
    "image": "/images/collections/vvf-cable.webp"
  },
  {
    "id": "item020",
    "name": "碍子引き工事セット",
    "rarity": "legendary",
    "category": "工法",
    "description": "昭和の電気工事で一般的だった工法。磁器製の碍子で電線を支持する。現在はほぼ使われないが、試験には出る。",
    "image": "/images/collections/gaishi.webp"
  }
]
```

**Phase 2 のアイテム数: 50個**
- ノーマル: 30個
- レア: 15個
- レジェンド: 5個

### コレクション画面

```
┌──────────────────────────────┐
│  パーツ図鑑     32/50 収集   │
│──────────────────────────────│
│                              │
│  ── 材料 ──                  │
│  [VVF] [VVR] [IV] [?] [?]   │  ← 取得済みはアイコン表示
│                              │     未取得は「?」シルエット
│  ── 器具 ──                  │
│  [🔌] [💡] [?] [?] [?]     │
│                              │
│  ── 工具 ──                  │
│  [🔧] [?] [?] [?] [?]      │
│                              │
│ (アイテムをタップすると)      │
│ ┌──────────────────────┐    │
│ │ ⚡ VVFケーブル        │    │  ← 詳細モーダル
│ │ [画像]                │    │
│ │ レアリティ: ★☆☆      │    │
│ │                       │    │
│ │ 正式名称は「600V...」 │    │  ← 豆知識 = 学習コンテンツ
│ └──────────────────────┘    │
└──────────────────────────────┘
```

### ドロップ演出

```
正解 → ドロップ判定 → 当選した場合:

1. 問題の正誤フィードバック表示 (通常通り)
2. 0.5秒後、画面下部からスライドイン:
   ┌────────────────────────┐
   │ 🎉 NEW!  VVFケーブル   │
   │          ★☆☆ ノーマル  │
   └────────────────────────┘
3. タップで詳細表示、放置で3秒後に自動消去
```

### IndexedDB スキーマ追加

```typescript
// db.ts に追加
collections!: Table<{ itemId: string; obtainedAt: number }>

// stores に追加
collections: "itemId"
```

---

## 2-5. 実績 (アチーブメント) システム

### 実績一覧 (Phase 2 で実装する分)

| ID | 名前 | 条件 | アイコン |
|---|---|---|---|
| ach001 | はじめの一歩 | 初めて問題を解いた | 🔰 |
| ach002 | 10問達成 | 累計10問回答 | ⚡ |
| ach003 | 50問達成 | 累計50問回答 | ⚡⚡ |
| ach004 | 100問達成 | 累計100問回答 | ⚡⚡⚡ |
| ach005 | 全問制覇 | 全問1回以上回答 | 🏅 |
| ach006 | 5連続正解 | 連続正解5問 | 🎯 |
| ach007 | 10連続正解 | 連続正解10問 | 🎯🎯 |
| ach008 | 電気理論マスター | 電気理論の合格力70%達成 | 🧠 |
| ach009 | 配線図マスター | 配線図の合格力70%達成 | 📐 |
| ach010 | 法規マスター | 法規の合格力70%達成 | 📜 |
| ach011 | 工事方法マスター | 工事方法の合格力70%達成 | 🔨 |
| ach012 | 器具材料マスター | 器具・材料の合格力70%達成 | 🔌 |
| ach013 | 検査測定マスター | 検査・測定の合格力70%達成 | 📏 |
| ach014 | 全分野制覇 | すべての分野で合格力70%以上 | 🏆 |
| ach015 | 合格圏内 | 総合合格力80%達成 | 👑 |

### 判定ロジック

```typescript
/**
 * 回答後に毎回呼ばれ、新たに達成した実績を返す
 */
export async function checkAchievements(
  passPower: PassPower,
  answerHistory: { totalAnswered: number; currentStreak: number },
): Promise<Achievement[]>
```

- 回答のたびにチェック（重い計算ではないのでクライアントサイドで十分）
- 一度解除した実績は再度通知しない
- 新規解除時は画面上部にトースト通知 + SE

### 実績画面

設定画面内、または学習統計画面内にセクションとして配置。

```
┌──────────────────────────────┐
│  実績        5/15 解除       │
│──────────────────────────────│
│                              │
│  🔰 はじめの一歩     ✓ 解除 │
│  ⚡ 10問達成          ✓ 解除 │
│  ⚡⚡ 50問達成        ✓ 解除 │
│  ⚡⚡⚡ 100問達成     🔒 未解除│  ← 未解除はグレーアウト
│  🎯 5連続正解         ✓ 解除 │
│  🎯🎯 10連続正解     🔒 未解除│
│  ...                         │
└──────────────────────────────┘
```

### IndexedDB スキーマ追加

```typescript
achievements!: Table<{ id: string; unlockedAt: number }>

// stores に追加
achievements: "id"
```

---

## 2-6. 追加の出題形式

### ◯✕クイズ

```
┌──────────────────────────────┐
│                              │
│  Q. 単相100Vの屋内配線で、   │
│  VVFケーブル1.6mmの許容電流  │
│  は27Aである                 │
│                              │
│  ┌──────┐    ┌──────┐      │
│  │  ◯  │    │  ✕  │      │  ← 大きな◯✕ボタン
│  │      │    │      │      │     各幅: 画面幅の40%
│  └──────┘    └──────┘      │     高さ: 80px
│                              │
└──────────────────────────────┘
```

**データ形式:**
```json
{
  "id": "q101",
  "category": "electrical_theory",
  "type": "true_false",
  "question": "単相100Vの屋内配線で、VVFケーブル1.6mmの許容電流は27Aである",
  "correctAnswer": false,
  "explanation": "VVF1.6mmの許容電流は27Aではなく、正しくは19A（周囲温度30℃の場合）。"
}
```

### 画像タップ（写真から器具を選ぶ）

```
┌──────────────────────────────┐
│                              │
│  Q. 「イ」の記号の器具は？    │
│  ┌──────────────────────┐   │
│  │   [配線図の画像]       │   │
│  │   「イ」にマーカー     │   │
│  └──────────────────────┘   │
│                              │
│  ┌─────┐ ┌─────┐          │
│  │写真1│ │写真2│          │  ← 2×2グリッド
│  └─────┘ └─────┘          │     各写真: 正方形
│  ┌─────┐ ┌─────┐          │     タップで選択
│  │写真3│ │写真4│          │
│  └─────┘ └─────┘          │
│                              │
└──────────────────────────────┘
```

**データ形式:**
```json
{
  "id": "q201",
  "category": "wiring_diagram",
  "type": "image_tap",
  "question": "「イ」の記号の器具はどれか",
  "questionImage": "/images/questions/q201_diagram.webp",
  "options": [
    "/images/questions/q201_opt1.webp",
    "/images/questions/q201_opt2.webp",
    "/images/questions/q201_opt3.webp",
    "/images/questions/q201_opt4.webp"
  ],
  "correctIndex": 2,
  "explanation": "「イ」は埋込連用タンブラスイッチの記号。"
}
```

### 型定義の拡張

```typescript
// Phase 1 の Question 型を拡張
export type QuestionType = "multiple_choice" | "true_false" | "image_tap"

export interface BaseQuestion {
  id: string
  category: Category
  type: QuestionType
  question: string
  image?: string
  explanation: string
  examYear?: number
  examSession?: "upper" | "lower"
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice"
  options: [string, string, string, string]
  correctIndex: number
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false"
  correctAnswer: boolean
}

export interface ImageTapQuestion extends BaseQuestion {
  type: "image_tap"
  questionImage: string
  options: [string, string, string, string]  // 画像パス
  correctIndex: number
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | ImageTapQuestion
```

---

## 2-7. 問題数の拡充

Phase 2 完了時点で **600問** を目標とする。

| 分野 | Phase 1 | Phase 2 追加 | 合計 |
|---|---|---|---|
| 電気理論 | 17問 | 83問 | 100問 |
| 配線図 | 17問 | 103問 | 120問 |
| 法規 | 17問 | 79問 | 96問 |
| 工事方法 | 17問 | 103問 | 120問 |
| 器具・材料 | 16問 | 80問 | 96問 |
| 検査・測定 | 16問 | 52問 | 68問 |
| **合計** | **100問** | **500問** | **600問** |

問題は過去10年分の過去問（上期・下期）から収録。重複する内容は統合する。

---

## 画面構成の変更

### BottomNav の更新

```
Phase 1: 📊 学習    🏠 ホーム    ⚙ 設定
Phase 2: 📊 学習    🏠 ホーム    🎁 図鑑    ⚙ 設定
```

4タブに変更。「図鑑」タブでコレクション+実績を表示。

---

## 完了条件

1. **認証**: Google/Apple ログインが動作し、ゲスト→ログイン移行でデータがマージされる
2. **同期**: 2台の端末で同じアカウントにログインし、学習データが同期される
3. **忘却曲線**: 過去に正解した問題が適切なタイミングで再出題される
4. **コレクション**: 正解時にパーツがドロップし、図鑑で確認できる（50個）
5. **実績**: 条件達成時に通知が表示され、実績一覧で確認できる（15個）
6. **出題形式**: 4択に加え、◯✕と画像タップが動作する
7. **問題数**: 600問以上が収録されている
