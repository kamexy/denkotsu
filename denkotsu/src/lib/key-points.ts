import type { KeyPoint, Category } from "@/types";
import keyPointsData from "@/data/key-points.json";

const keyPoints: KeyPoint[] = keyPointsData as KeyPoint[];

export function getAllKeyPoints(): KeyPoint[] {
  return keyPoints;
}

export function getKeyPointsByCategory(category: Category): KeyPoint[] {
  return keyPoints.filter((kp) => kp.category === category);
}

export function getKeyPointById(id: string): KeyPoint | undefined {
  return keyPoints.find((kp) => kp.id === id);
}
