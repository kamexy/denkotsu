import { describe, expect, test } from "vitest";
import {
  formatClock,
  PRACTICAL_TIMELINE_PHASES,
  PRACTICAL_TIMELINE_TOTAL_SECONDS,
  toSeconds,
} from "@/lib/practical-timeline";

describe("practical timeline", () => {
  test("timeline total is exactly 40 minutes", () => {
    const summed = PRACTICAL_TIMELINE_PHASES.reduce(
      (total, phase) => total + toSeconds(phase.targetMinutes),
      0
    );
    expect(PRACTICAL_TIMELINE_TOTAL_SECONDS).toBe(40 * 60);
    expect(summed).toBe(PRACTICAL_TIMELINE_TOTAL_SECONDS);
  });

  test("clock formatter pads values", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(2400)).toBe("40:00");
    expect(formatClock(-10)).toBe("00:00");
  });
});
