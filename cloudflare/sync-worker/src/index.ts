export interface Env {
  DB: D1Database;
  CORS_ORIGIN?: string;
}

type SyncSettingsSnapshot = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  updatedAt: number;
};

type SyncSnapshot = {
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    answeredAt: number;
    timeSpentMs: number;
  }>;
  spacedRepetition: Array<{
    questionId: string;
    easeFactor: number;
    intervalDays: number;
    nextReviewAt: number;
    repetitionCount: number;
    lastAnsweredAt: number;
  }>;
  settings: SyncSettingsSnapshot;
};

const SYNC_ID_PATTERN = /^[a-zA-Z0-9_-]{6,64}$/;

function corsHeaders(env: Env): Headers {
  const origin = (env.CORS_ORIGIN ?? "*").trim() || "*";
  return new Headers({
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  });
}

function jsonResponse(
  body: unknown,
  env: Env,
  status = 200
): Response {
  const headers = corsHeaders(env);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function validateSyncId(syncId: unknown): string | null {
  if (typeof syncId !== "string") return null;
  const normalized = syncId.trim();
  return SYNC_ID_PATTERN.test(normalized) ? normalized : null;
}

function isValidSnapshot(input: unknown): input is SyncSnapshot {
  if (!input || typeof input !== "object") return false;
  const snapshot = input as SyncSnapshot;
  if (!Array.isArray(snapshot.answers)) return false;
  if (!Array.isArray(snapshot.spacedRepetition)) return false;
  if (!snapshot.settings || typeof snapshot.settings !== "object") return false;
  if (typeof snapshot.settings.soundEnabled !== "boolean") return false;
  if (typeof snapshot.settings.vibrationEnabled !== "boolean") return false;
  if (typeof snapshot.settings.updatedAt !== "number") return false;
  return true;
}

async function handlePush(request: Request, env: Env): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "invalid-json" }, env, 400);
  }

  const body = payload as {
    syncId?: unknown;
    clientUpdatedAt?: unknown;
    snapshot?: unknown;
  };

  const syncId = validateSyncId(body.syncId);
  if (!syncId) {
    return jsonResponse({ success: false, error: "invalid-sync-id" }, env, 400);
  }

  const clientUpdatedAt =
    typeof body.clientUpdatedAt === "number" && Number.isFinite(body.clientUpdatedAt)
      ? body.clientUpdatedAt
      : 0;

  if (!isValidSnapshot(body.snapshot)) {
    return jsonResponse({ success: false, error: "invalid-snapshot" }, env, 400);
  }

  const existing = await env.DB.prepare(
    "SELECT payload_json, updated_at FROM sync_snapshots WHERE sync_id = ?1"
  ).bind(syncId).first<{ payload_json: string; updated_at: number }>();

  if (existing && clientUpdatedAt < existing.updated_at) {
    return jsonResponse(
      {
        success: true,
        applied: false,
        reason: "stale",
        serverUpdatedAt: existing.updated_at,
      },
      env
    );
  }

  const serverUpdatedAt = Math.max(clientUpdatedAt, Date.now());
  await env.DB.prepare(
    `INSERT INTO sync_snapshots (sync_id, payload_json, updated_at)
     VALUES (?1, ?2, ?3)
     ON CONFLICT(sync_id) DO UPDATE SET
       payload_json = excluded.payload_json,
       updated_at = excluded.updated_at`
  )
    .bind(syncId, JSON.stringify(body.snapshot), serverUpdatedAt)
    .run();

  return jsonResponse(
    {
      success: true,
      applied: true,
      serverUpdatedAt,
    },
    env
  );
}

async function handlePull(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const syncId = validateSyncId(url.searchParams.get("syncId"));
  if (!syncId) {
    return jsonResponse({ success: false, error: "invalid-sync-id" }, env, 400);
  }

  const row = await env.DB.prepare(
    "SELECT payload_json, updated_at FROM sync_snapshots WHERE sync_id = ?1"
  ).bind(syncId).first<{ payload_json: string; updated_at: number }>();

  if (!row) {
    return jsonResponse(
      {
        success: true,
        hasSnapshot: false,
        serverUpdatedAt: 0,
      },
      env
    );
  }

  return jsonResponse(
    {
      success: true,
      hasSnapshot: true,
      serverUpdatedAt: row.updated_at,
      snapshot: JSON.parse(row.payload_json),
    },
    env
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/api/sync/pull") {
      return handlePull(request, env);
    }
    if (request.method === "POST" && url.pathname === "/api/sync/push") {
      return handlePush(request, env);
    }
    if (request.method === "GET" && url.pathname === "/healthz") {
      return jsonResponse({ ok: true, timestamp: Date.now() }, env);
    }

    return jsonResponse({ success: false, error: "not-found" }, env, 404);
  },
};
