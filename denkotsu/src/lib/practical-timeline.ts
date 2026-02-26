export interface PracticalTimelinePhase {
  id: string;
  title: string;
  targetMinutes: number;
}

export const PRACTICAL_TIMELINE_TOTAL_SECONDS = 40 * 60;

export const PRACTICAL_TIMELINE_PHASES: PracticalTimelinePhase[] = [
  { id: "diagram", title: "複線図作成", targetMinutes: 5 },
  { id: "cable", title: "ケーブル加工", targetMinutes: 15 },
  { id: "wiring", title: "器具への結線", targetMinutes: 10 },
  { id: "join", title: "電線の接続", targetMinutes: 5 },
  { id: "check", title: "見直し・修正", targetMinutes: 5 },
];

export function formatClock(totalSeconds: number): string {
  const normalized = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(normalized / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (normalized % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function toSeconds(minutes: number): number {
  return Math.max(0, Math.floor(minutes * 60));
}
