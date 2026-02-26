const CANDIDATE_PROGRESS_KEY = "denkotsu:practical:candidates:v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readArray(key: string): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeArray(key: string, values: string[]): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // ignore storage quota / availability errors
  }
}

export function readCandidateCompletedIds(): number[] {
  const values = readArray(CANDIDATE_PROGRESS_KEY)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 13);
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

export function writeCandidateCompletedIds(ids: number[]): void {
  const normalized = Array.from(
    new Set(ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 13))
  ).sort((a, b) => a - b);
  writeArray(
    CANDIDATE_PROGRESS_KEY,
    normalized.map((id) => String(id))
  );
}
