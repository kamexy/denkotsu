/** 問題の分野 */
export type Category =
  | "electrical_theory"
  | "wiring_diagram"
  | "laws"
  | "construction_method"
  | "equipment_material"
  | "inspection";

/** 分野の日本語ラベル */
export const CATEGORY_LABELS: Record<Category, string> = {
  electrical_theory: "電気理論",
  wiring_diagram: "配線図",
  laws: "法規",
  construction_method: "工事方法",
  equipment_material: "器具・材料",
  inspection: "検査・測定",
};

/** 分野の色 */
export const CATEGORY_COLORS: Record<Category, string> = {
  electrical_theory: "bg-teal-600",
  wiring_diagram: "bg-sky-600",
  laws: "bg-amber-500",
  construction_method: "bg-emerald-600",
  equipment_material: "bg-orange-500",
  inspection: "bg-cyan-600",
};

/** 試験での出題比率 */
export const CATEGORY_WEIGHTS: Record<Category, number> = {
  electrical_theory: 0.16,
  wiring_diagram: 0.2,
  laws: 0.16,
  construction_method: 0.2,
  equipment_material: 0.16,
  inspection: 0.12,
};

/** 全分野リスト */
export const ALL_CATEGORIES: Category[] = [
  "electrical_theory",
  "wiring_diagram",
  "laws",
  "construction_method",
  "equipment_material",
  "inspection",
];

/** 問題データ */
export interface Question {
  id: string;
  category: Category;
  question: string;
  image?: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  examYear?: number;
  examSession?: "upper" | "lower";
}

/** ユーザーの回答記録 */
export interface AnswerRecord {
  id?: number;
  questionId: string;
  isCorrect: boolean;
  answeredAt: number;
  timeSpentMs: number;
}

/** 忘却曲線データ */
export interface SpacedRepetition {
  questionId: string;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: number;
  repetitionCount: number;
  lastAnsweredAt: number;
}

/** 合格力データ */
export interface PassPower {
  overall: number;
  byCategory: Record<Category, number>;
  totalAnswered: number;
  lastUpdated: number;
}

/** セッション統計 */
export interface SessionStats {
  totalAnswered: number;
  correctCount: number;
  startedAt: number;
  previousPassPower: number;
}

/** 要点カード */
export interface KeyPoint {
  id: string;
  category: Category;
  title: string;
  formula: string | null;
  body: string;
  example: string | null;
  image?: string;
}

/** ユーザー設定 */
export interface UserSettings {
  id: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  syncId?: string;
  lastSyncedAt?: number;
  updatedAt: number;
}

/** クラウド同期向け設定スナップショット */
export interface SyncSettingsSnapshot {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  updatedAt: number;
}

/** クラウド同期向けスナップショット */
export interface SyncSnapshot {
  answers: Omit<AnswerRecord, "id">[];
  spacedRepetition: SpacedRepetition[];
  settings: SyncSettingsSnapshot;
}
