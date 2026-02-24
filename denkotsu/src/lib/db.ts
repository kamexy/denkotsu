import Dexie, { type Table } from "dexie";
import type {
  AchievementUnlock,
  AnswerRecord,
  QuizMode,
  SpacedRepetition,
  ThemePreference,
  UserCollection,
  UserSettings,
} from "@/types";

const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
const DEFAULT_QUIZ_MODE: QuizMode = "balanced";
const DEFAULT_REPEAT_DELAY_QUESTIONS = 2;
const DEFAULT_MAX_SAME_CATEGORY_IN_WINDOW = 3;
const DEFAULT_DAILY_GOAL_QUESTIONS = 20;
const DEFAULT_WEEKLY_GOAL_STUDY_DAYS = 5;
const MIN_REPEAT_DELAY_QUESTIONS = 0;
const MAX_REPEAT_DELAY_QUESTIONS = 10;
const MIN_SAME_CATEGORY_LIMIT = 1;
const MAX_SAME_CATEGORY_LIMIT = 6;
const MIN_DAILY_GOAL_QUESTIONS = 5;
const MAX_DAILY_GOAL_QUESTIONS = 100;
const MIN_WEEKLY_GOAL_STUDY_DAYS = 1;
const MAX_WEEKLY_GOAL_STUDY_DAYS = 7;

function normalizeThemePreference(value: unknown): ThemePreference {
  return value === "light" || value === "dark" || value === "system"
    ? value
    : DEFAULT_THEME_PREFERENCE;
}

function normalizeQuizMode(value: unknown): QuizMode {
  return value === "mistake_focus" || value === "weak_category" || value === "balanced"
    ? value
    : DEFAULT_QUIZ_MODE;
}

function normalizeIntInRange(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.round(parsed);
  if (normalized < min) return min;
  if (normalized > max) return max;
  return normalized;
}

export class DenkotsuDB extends Dexie {
  answers!: Table<AnswerRecord>;
  spacedRepetition!: Table<SpacedRepetition>;
  settings!: Table<UserSettings>;
  collections!: Table<UserCollection, string>;
  achievementUnlocks!: Table<AchievementUnlock, string>;

  constructor() {
    super("denkotsu");
    this.version(1).stores({
      answers: "++id, questionId, answeredAt",
      spacedRepetition: "questionId",
      settings: "id",
    });
    this.version(2).stores({
      answers: "++id, questionId, answeredAt",
      spacedRepetition: "questionId",
      settings: "id",
      collections: "itemId, obtainedAt",
      achievementUnlocks: "achievementId, unlockedAt",
    });
  }
}

export const db = new DenkotsuDB();

/** ユーザー設定を取得（なければデフォルト） */
export async function getSettings(): Promise<UserSettings> {
  const now = Date.now();
  const s = await db.settings.get("default");
  if (s) {
    const normalized: UserSettings = {
      id: "default",
      soundEnabled: s.soundEnabled ?? true,
      vibrationEnabled: s.vibrationEnabled ?? true,
      themePreference: normalizeThemePreference(s.themePreference),
      quizMode: normalizeQuizMode(s.quizMode),
      repeatDelayQuestions: normalizeIntInRange(
        s.repeatDelayQuestions,
        DEFAULT_REPEAT_DELAY_QUESTIONS,
        MIN_REPEAT_DELAY_QUESTIONS,
        MAX_REPEAT_DELAY_QUESTIONS
      ),
      maxSameCategoryInWindow: normalizeIntInRange(
        s.maxSameCategoryInWindow,
        DEFAULT_MAX_SAME_CATEGORY_IN_WINDOW,
        MIN_SAME_CATEGORY_LIMIT,
        MAX_SAME_CATEGORY_LIMIT
      ),
      dailyGoalQuestions: normalizeIntInRange(
        s.dailyGoalQuestions,
        DEFAULT_DAILY_GOAL_QUESTIONS,
        MIN_DAILY_GOAL_QUESTIONS,
        MAX_DAILY_GOAL_QUESTIONS
      ),
      weeklyGoalStudyDays: normalizeIntInRange(
        s.weeklyGoalStudyDays,
        DEFAULT_WEEKLY_GOAL_STUDY_DAYS,
        MIN_WEEKLY_GOAL_STUDY_DAYS,
        MAX_WEEKLY_GOAL_STUDY_DAYS
      ),
      syncId: s.syncId,
      lastSyncedAt: s.lastSyncedAt,
      updatedAt: s.updatedAt ?? now,
    };

    const needsUpdate =
      s.soundEnabled !== normalized.soundEnabled ||
      s.vibrationEnabled !== normalized.vibrationEnabled ||
      s.themePreference !== normalized.themePreference ||
      s.quizMode !== normalized.quizMode ||
      s.repeatDelayQuestions !== normalized.repeatDelayQuestions ||
      s.maxSameCategoryInWindow !== normalized.maxSameCategoryInWindow ||
      s.dailyGoalQuestions !== normalized.dailyGoalQuestions ||
      s.weeklyGoalStudyDays !== normalized.weeklyGoalStudyDays ||
      s.syncId !== normalized.syncId ||
      s.lastSyncedAt !== normalized.lastSyncedAt ||
      s.updatedAt !== normalized.updatedAt;

    if (needsUpdate) {
      await db.settings.put(normalized);
    }

    return normalized;
  }

  const defaults: UserSettings = {
    id: "default",
    soundEnabled: true,
    vibrationEnabled: true,
    themePreference: DEFAULT_THEME_PREFERENCE,
    quizMode: DEFAULT_QUIZ_MODE,
    repeatDelayQuestions: DEFAULT_REPEAT_DELAY_QUESTIONS,
    maxSameCategoryInWindow: DEFAULT_MAX_SAME_CATEGORY_IN_WINDOW,
    dailyGoalQuestions: DEFAULT_DAILY_GOAL_QUESTIONS,
    weeklyGoalStudyDays: DEFAULT_WEEKLY_GOAL_STUDY_DAYS,
    updatedAt: now,
  };
  await db.settings.put(defaults);
  return defaults;
}

/** ユーザー設定を更新 */
export async function updateSettings(
  partial: Partial<Omit<UserSettings, "id">>
): Promise<void> {
  const current = await getSettings();
  const keys = Object.keys(partial);
  const shouldUpdateTimestamp =
    keys.length === 0 ||
    keys.some((k) => k !== "lastSyncedAt") ||
    typeof partial.updatedAt === "number";

  const nextUpdatedAt =
    partial.updatedAt ??
    (shouldUpdateTimestamp
      ? Date.now()
      : (current.updatedAt ?? Date.now()));

  await db.settings.put({
    ...current,
    ...partial,
    updatedAt: nextUpdatedAt,
  });
}

/** 全学習データをリセット */
export async function resetAllData(): Promise<void> {
  await db.answers.clear();
  await db.spacedRepetition.clear();
  await db.collections.clear();
  await db.achievementUnlocks.clear();
}
