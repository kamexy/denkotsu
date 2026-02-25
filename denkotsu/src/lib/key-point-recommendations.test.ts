import { describe, expect, it } from "vitest";
import { recommendKeyPoints } from "./key-point-recommendations";
import type { Category, KeyPoint, PassPower } from "@/types";
import { ALL_CATEGORIES } from "@/types";

function createKeyPoint(id: string, category: Category): KeyPoint {
  return {
    id,
    category,
    title: `title-${id}`,
    formula: null,
    body: `body-${id}`,
    example: null,
  };
}

function createPassPower(
  byCategory: Record<Category, number>,
  totalAnswered = 100
): PassPower {
  return {
    overall: 50,
    byCategory,
    totalAnswered,
    lastUpdated: Date.now(),
  };
}

const keyPoints = [
  createKeyPoint("et-01", "electrical_theory"),
  createKeyPoint("et-02", "electrical_theory"),
  createKeyPoint("wd-01", "wiring_diagram"),
  createKeyPoint("wd-02", "wiring_diagram"),
  createKeyPoint("lw-01", "laws"),
  createKeyPoint("lw-02", "laws"),
  createKeyPoint("cm-01", "construction_method"),
  createKeyPoint("cm-02", "construction_method"),
  createKeyPoint("em-01", "equipment_material"),
  createKeyPoint("em-02", "equipment_material"),
  createKeyPoint("in-01", "inspection"),
  createKeyPoint("in-02", "inspection"),
];

describe("recommendKeyPoints", () => {
  it("初学習時は重み順で幅広く推薦する", () => {
    const result = recommendKeyPoints({
      keyPoints,
      passPower: null,
      selectedCategory: "all",
      limit: 6,
    });

    expect(result).toHaveLength(6);
    expect(new Set(result.map((r) => r.keyPoint.id)).size).toBe(6);
    expect(result.map((r) => r.reason)).toContain("学習開始におすすめ");
  });

  it("学習済みなら弱いカテゴリを優先する", () => {
    const passPower = createPassPower({
      electrical_theory: 20,
      wiring_diagram: 80,
      laws: 25,
      construction_method: 85,
      equipment_material: 75,
      inspection: 70,
    });

    const result = recommendKeyPoints({
      keyPoints,
      passPower,
      selectedCategory: "all",
      limit: 4,
    });

    expect(result).toHaveLength(4);
    expect(result[0].keyPoint.category).toBe("electrical_theory");
    expect(result[1].keyPoint.category).toBe("electrical_theory");
    expect(result[2].keyPoint.category).toBe("laws");
  });

  it("カテゴリ選択中はそのカテゴリのみ推薦する", () => {
    const passPower = createPassPower(
      Object.fromEntries(ALL_CATEGORIES.map((c) => [c, 60])) as Record<
        Category,
        number
      >
    );

    const result = recommendKeyPoints({
      keyPoints,
      passPower,
      selectedCategory: "inspection",
      limit: 5,
    });

    expect(result).toHaveLength(2);
    expect(result.every((r) => r.keyPoint.category === "inspection")).toBe(true);
    expect(result[0].reason).toContain("合格力60%");
  });
});
