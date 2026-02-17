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
  const now = Date.now();
  const s = await db.settings.get("default");
  if (s) {
    const normalized: UserSettings = {
      id: "default",
      soundEnabled: s.soundEnabled ?? true,
      vibrationEnabled: s.vibrationEnabled ?? true,
      syncId: s.syncId,
      lastSyncedAt: s.lastSyncedAt,
      updatedAt: s.updatedAt ?? now,
    };

    const needsUpdate =
      s.soundEnabled !== normalized.soundEnabled ||
      s.vibrationEnabled !== normalized.vibrationEnabled ||
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
}
