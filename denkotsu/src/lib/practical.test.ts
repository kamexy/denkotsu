import { describe, expect, test } from "vitest";
import { getPracticalDefectQuestions, getPracticalWiringProblems } from "@/lib/practical";

describe("practical data", () => {
  test("wiring problems must cover 13 candidates", () => {
    const problems = getPracticalWiringProblems();
    expect(problems).toHaveLength(13);
    expect(new Set(problems.map((problem) => problem.id)).size).toBe(13);
  });

  test("defect questions must match phase4 minimum set", () => {
    const questions = getPracticalDefectQuestions();
    expect(questions).toHaveLength(30);

    const defective = questions.filter((question) => question.hasDefect);
    const valid = questions.filter((question) => !question.hasDefect);

    expect(defective).toHaveLength(20);
    expect(valid).toHaveLength(10);

    const typeCount = defective.reduce<Record<string, number>>((acc, question) => {
      const key = question.defectType ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    expect(typeCount["圧着不良"]).toBe(8);
    expect(typeCount["結線不良"]).toBe(8);
    expect(typeCount["寸法不良"]).toBe(4);
  });

  test("every defective question has marker coordinates in expected range", () => {
    const defective = getPracticalDefectQuestions().filter((question) => question.hasDefect);

    defective.forEach((question) => {
      expect(question.defectMarkerPosition).toBeDefined();
      expect(typeof question.defectMarkerLabel).toBe("string");
      expect((question.defectMarkerLabel ?? "").length).toBeGreaterThanOrEqual(3);
      expect(question.defectMarkerPosition?.x).toBeGreaterThanOrEqual(0);
      expect(question.defectMarkerPosition?.x).toBeLessThanOrEqual(95);
      expect(question.defectMarkerPosition?.y).toBeGreaterThanOrEqual(0);
      expect(question.defectMarkerPosition?.y).toBeLessThanOrEqual(95);
      expect(question.defectMarkerPosition?.width).toBeGreaterThan(0);
      expect(question.defectMarkerPosition?.width).toBeLessThanOrEqual(60);
      expect(question.defectMarkerPosition?.height).toBeGreaterThan(0);
      expect(question.defectMarkerPosition?.height).toBeLessThanOrEqual(60);
    });
  });
});
