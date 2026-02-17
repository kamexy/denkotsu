import { db, getSettings, updateSettings } from "@/lib/db";
import type { SyncSnapshot, UserSettings } from "@/types";

const SYNC_ID_PATTERN = /^[a-zA-Z0-9_-]{6,64}$/;
const STARTUP_SYNC_GUARD_KEY = "denkotsu:startup-sync-done";

type PullResponse =
  | {
      success: true;
      hasSnapshot: false;
      serverUpdatedAt: number;
    }
  | {
      success: true;
      hasSnapshot: true;
      serverUpdatedAt: number;
      snapshot: SyncSnapshot;
    };

type PushResponse = {
  success: true;
  applied: boolean;
  serverUpdatedAt: number;
  reason?: "stale";
};

function getSyncApiBase(): string {
  return (process.env.NEXT_PUBLIC_SYNC_API_BASE ?? "").trim().replace(/\/+$/, "");
}

function normalizeSyncId(syncId: string): string {
  return syncId.trim();
}

function assertValidSyncId(syncId: string): void {
  if (!SYNC_ID_PATTERN.test(syncId)) {
    throw new Error("同期コードは6〜64文字の英数字・ハイフン・アンダースコアで入力してください。");
  }
}

function ensureSyncConfigured(): string {
  const base = getSyncApiBase();
  if (!base) {
    throw new Error("同期APIが未設定です（NEXT_PUBLIC_SYNC_API_BASE）。");
  }
  return base;
}

function toSyncSettingsSnapshot(settings: UserSettings): SyncSnapshot["settings"] {
  return {
    soundEnabled: settings.soundEnabled,
    vibrationEnabled: settings.vibrationEnabled,
    updatedAt: settings.updatedAt ?? Date.now(),
  };
}

function sanitizeSnapshot(input: SyncSnapshot): SyncSnapshot {
  const answers = Array.isArray(input.answers)
    ? input.answers
        .filter((a) =>
          a &&
          typeof a.questionId === "string" &&
          typeof a.isCorrect === "boolean" &&
          typeof a.answeredAt === "number" &&
          typeof a.timeSpentMs === "number"
        )
        .map((a) => ({
          questionId: a.questionId,
          isCorrect: a.isCorrect,
          answeredAt: a.answeredAt,
          timeSpentMs: a.timeSpentMs,
        }))
    : [];

  const spacedRepetition = Array.isArray(input.spacedRepetition)
    ? input.spacedRepetition.filter((r) =>
      r &&
      typeof r.questionId === "string" &&
      typeof r.easeFactor === "number" &&
      typeof r.intervalDays === "number" &&
      typeof r.nextReviewAt === "number" &&
      typeof r.repetitionCount === "number" &&
      typeof r.lastAnsweredAt === "number"
    )
    : [];

  const settings = {
    soundEnabled: Boolean(input.settings?.soundEnabled),
    vibrationEnabled: Boolean(input.settings?.vibrationEnabled),
    updatedAt:
      typeof input.settings?.updatedAt === "number"
        ? input.settings.updatedAt
        : Date.now(),
  };

  return { answers, spacedRepetition, settings };
}

export function isCloudSyncEnabled(): boolean {
  return Boolean(getSyncApiBase());
}

export async function getLocalLatestTimestamp(): Promise<number> {
  const [latestAnswer, settings] = await Promise.all([
    db.answers.orderBy("answeredAt").last(),
    getSettings(),
  ]);
  return Math.max(latestAnswer?.answeredAt ?? 0, settings.updatedAt ?? 0);
}

export async function buildLocalSnapshot(): Promise<SyncSnapshot> {
  const [answers, spacedRepetition, settings] = await Promise.all([
    db.answers.toArray(),
    db.spacedRepetition.toArray(),
    getSettings(),
  ]);

  return {
    answers: answers.map((a) => ({
      questionId: a.questionId,
      isCorrect: a.isCorrect,
      answeredAt: a.answeredAt,
      timeSpentMs: a.timeSpentMs,
    })),
    spacedRepetition,
    settings: toSyncSettingsSnapshot(settings),
  };
}

export async function pushCloudSnapshot(rawSyncId: string): Promise<PushResponse> {
  const base = ensureSyncConfigured();
  const syncId = normalizeSyncId(rawSyncId);
  assertValidSyncId(syncId);

  const snapshot = await buildLocalSnapshot();
  const clientUpdatedAt = await getLocalLatestTimestamp();
  const response = await fetch(`${base}/api/sync/push`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      syncId,
      clientUpdatedAt,
      snapshot,
    }),
  });

  if (!response.ok) {
    throw new Error(`クラウド保存に失敗しました (${response.status})`);
  }

  const data = (await response.json()) as PushResponse;

  await updateSettings({
    syncId,
    lastSyncedAt: data.serverUpdatedAt,
  });

  return data;
}

export async function pullCloudSnapshot(rawSyncId: string): Promise<PullResponse> {
  const base = ensureSyncConfigured();
  const syncId = normalizeSyncId(rawSyncId);
  assertValidSyncId(syncId);

  const response = await fetch(
    `${base}/api/sync/pull?syncId=${encodeURIComponent(syncId)}`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`クラウド読込に失敗しました (${response.status})`);
  }

  return (await response.json()) as PullResponse;
}

export async function applyRemoteSnapshot(
  snapshot: SyncSnapshot,
  syncId: string,
  serverUpdatedAt: number
): Promise<void> {
  const normalized = sanitizeSnapshot(snapshot);
  const now = Date.now();

  await db.transaction("rw", db.answers, db.spacedRepetition, db.settings, async () => {
    await db.answers.clear();
    if (normalized.answers.length > 0) {
      await db.answers.bulkAdd(normalized.answers);
    }

    await db.spacedRepetition.clear();
    if (normalized.spacedRepetition.length > 0) {
      await db.spacedRepetition.bulkPut(normalized.spacedRepetition);
    }

    await db.settings.put({
      id: "default",
      soundEnabled: normalized.settings.soundEnabled,
      vibrationEnabled: normalized.settings.vibrationEnabled,
      syncId,
      lastSyncedAt: serverUpdatedAt,
      updatedAt: normalized.settings.updatedAt || now,
    });
  });
}

let backgroundPushTimer: ReturnType<typeof setTimeout> | null = null;

export function triggerBackgroundSyncPush(delayMs = 1200): void {
  if (typeof window === "undefined") return;
  if (!isCloudSyncEnabled()) return;
  if (!navigator.onLine) return;

  if (backgroundPushTimer) {
    clearTimeout(backgroundPushTimer);
  }

  backgroundPushTimer = setTimeout(() => {
    void (async () => {
      try {
        const settings = await getSettings();
        if (!settings.syncId) return;
        await pushCloudSnapshot(settings.syncId);
      } catch {
        // バックグラウンド同期は失敗しても学習体験を阻害しない
      }
    })();
  }, delayMs);
}

export async function runStartupCloudPull(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isCloudSyncEnabled()) return;
  if (!navigator.onLine) return;
  if (sessionStorage.getItem(STARTUP_SYNC_GUARD_KEY) === "1") return;

  sessionStorage.setItem(STARTUP_SYNC_GUARD_KEY, "1");

  try {
    const settings = await getSettings();
    if (!settings.syncId) return;

    const result = await pullCloudSnapshot(settings.syncId);
    if (!result.hasSnapshot) return;

    const localLatest = await getLocalLatestTimestamp();
    if (result.serverUpdatedAt <= localLatest) return;

    await applyRemoteSnapshot(
      result.snapshot,
      settings.syncId,
      result.serverUpdatedAt
    );
  } catch {
    // 起動時同期失敗は無視
  }
}
