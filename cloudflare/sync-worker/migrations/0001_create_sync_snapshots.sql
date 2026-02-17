CREATE TABLE IF NOT EXISTS sync_snapshots (
  sync_id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_snapshots_updated_at
  ON sync_snapshots(updated_at);
