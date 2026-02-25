import { ALL_CATEGORIES, CATEGORY_WEIGHTS } from "@/types";
import type { Category, KeyPoint, PassPower } from "@/types";

const DEFAULT_LIMIT = 6;

export interface KeyPointRecommendation {
  keyPoint: KeyPoint;
  reason: string;
  categoryPower: number | null;
}

function buildReason(categoryPower: number | null): string {
  if (categoryPower == null) return "学習開始におすすめ";
  if (categoryPower < 40) return `合格力${categoryPower}%: 基礎を優先`;
  if (categoryPower < 70) return `合格力${categoryPower}%: 復習推奨`;
  return `合格力${categoryPower}%: 仕上げ確認`;
}

function toCategoryMap(keyPoints: KeyPoint[]): Map<Category, KeyPoint[]> {
  const grouped = new Map<Category, KeyPoint[]>();
  for (const category of ALL_CATEGORIES) {
    grouped.set(category, []);
  }
  for (const keyPoint of keyPoints) {
    grouped.get(keyPoint.category)?.push(keyPoint);
  }
  return grouped;
}

export function recommendKeyPoints(params: {
  keyPoints: KeyPoint[];
  passPower: PassPower | null;
  selectedCategory: Category | "all";
  limit?: number;
}): KeyPointRecommendation[] {
  const { keyPoints, passPower, selectedCategory } = params;
  const limit = Math.max(0, params.limit ?? DEFAULT_LIMIT);
  if (limit === 0 || keyPoints.length === 0) return [];

  const byCategory = toCategoryMap(keyPoints);
  const recommendations: KeyPointRecommendation[] = [];
  const usedIds = new Set<string>();

  const pushFromCategory = (
    category: Category,
    maxCount: number,
    categoryPower: number | null
  ) => {
    if (maxCount <= 0 || recommendations.length >= limit) return;
    let remaining = maxCount;
    const pool = byCategory.get(category) ?? [];
    for (const keyPoint of pool) {
      if (usedIds.has(keyPoint.id)) continue;
      recommendations.push({
        keyPoint,
        reason: buildReason(categoryPower),
        categoryPower,
      });
      usedIds.add(keyPoint.id);
      if (recommendations.length >= limit) return;
      remaining -= 1;
      if (remaining <= 0) return;
    }
  };

  if (selectedCategory !== "all") {
    const power = passPower?.byCategory[selectedCategory] ?? null;
    pushFromCategory(selectedCategory, limit, power);
    return recommendations;
  }

  if (!passPower || passPower.totalAnswered === 0) {
    const byWeight = [...ALL_CATEGORIES].sort((a, b) => {
      const weightDiff = CATEGORY_WEIGHTS[b] - CATEGORY_WEIGHTS[a];
      if (weightDiff !== 0) return weightDiff;
      return ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b);
    });

    while (recommendations.length < limit) {
      let addedInRound = 0;
      for (const category of byWeight) {
        const before = recommendations.length;
        pushFromCategory(category, 1, null);
        if (recommendations.length > before) {
          addedInRound += 1;
        }
        if (recommendations.length >= limit) break;
      }
      if (addedInRound === 0) break;
    }
    return recommendations;
  }

  const orderedByWeakness = [...ALL_CATEGORIES].sort((a, b) => {
    const powerA = passPower.byCategory[a] ?? 0;
    const powerB = passPower.byCategory[b] ?? 0;
    if (powerA !== powerB) return powerA - powerB;
    const weightDiff = CATEGORY_WEIGHTS[b] - CATEGORY_WEIGHTS[a];
    if (weightDiff !== 0) return weightDiff;
    return ALL_CATEGORIES.indexOf(a) - ALL_CATEGORIES.indexOf(b);
  });

  for (const category of orderedByWeakness) {
    const power = passPower.byCategory[category] ?? 0;
    const quota = power < 70 ? 2 : 1;
    pushFromCategory(category, quota, power);
    if (recommendations.length >= limit) return recommendations;
  }

  for (const category of orderedByWeakness) {
    const power = passPower.byCategory[category] ?? 0;
    pushFromCategory(category, limit, power);
    if (recommendations.length >= limit) break;
  }

  return recommendations;
}
