import Dexie, { type Table } from "dexie";
import type { AnswerRecord, SpacedRepetition, UserSettings } from "@/types";

export class DenkotsuDB extends Dexie {
  answers!: Table<AnswerRecord>;
  spacedRepetition!: Table<SpacedRepetition>;
  settings!: Table<UserSettings>;

  constructor() {
    super("denkotsu");
    this.version(1).stores({
      answers: "++id, questionId, answeredAt",
      spacedRepetition: "questionId",
      settings: "id",
    });
  }
}

export const db = new DenkotsuDB();

/** ユーザー設定を取得（なければデフォルト） */
export async function getSettings(): Promise<UserSettings> {
  const s = await db.settings.get("default");
  if (s) return s;
  const defaults: UserSettings = {
    id: "default",
    soundEnabled: true,
    vibrationEnabled: true,
  };
  await db.settings.put(defaults);
  return defaults;
}

/** ユーザー設定を更新 */
export async function updateSettings(
  partial: Partial<Omit<UserSettings, "id">>
): Promise<void> {
  const current = await getSettings();
  await db.settings.put({ ...current, ...partial });
}

/** 全学習データをリセット */
export async function resetAllData(): Promise<void> {
  await db.answers.clear();
  await db.spacedRepetition.clear();
}
