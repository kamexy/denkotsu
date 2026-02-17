import { db } from "./db";
import { getAllQuestions } from "./questions";
import type { PassPower, Category } from "@/types";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** 時間減衰係数を計算 */
function timeDecay(lastAnsweredAt: number): number {
  const daysSince = (Date.now() - lastAnsweredAt) / (24 * 60 * 60 * 1000);
  if (daysSince <= 0) return 1.0;
  if (daysSince <= 7) return 1.0 - daysSince * (0.1 / 7); // 1.0 → 0.9
  if (daysSince <= 14) return 0.9 - (daysSince - 7) * (0.1 / 7); // 0.9 → 0.8
  if (daysSince <= 30) return 0.8 - (daysSince - 14) * (0.2 / 16); // 0.8 → 0.6
  if (daysSince <= 60) return 0.6 - (daysSince - 30) * (0.2 / 30); // 0.6 → 0.4
  return 0.4;
}

/**
 * 合格力を計算する
 *
 * 各分野の合格力 = 正答率 × 回答カバー率 × 時間減衰
 * 全体の合格力 = 各分野の加重平均（試験の出題比率で重み付け）
 */
export async function calculatePassPower(): Promise<PassPower> {
  const allQuestions = getAllQuestions();
  const allAnswers = await db.answers.toArray();
  const now = Date.now();

  const categories: Category[] = [
    "electrical_theory",
    "wiring_diagram",
    "laws",
    "construction_method",
    "equipment_material",
    "inspection",
  ];

  const weights: Record<Category, number> = {
    electrical_theory: 0.16,
    wiring_diagram: 0.2,
    laws: 0.16,
    construction_method: 0.2,
    equipment_material: 0.16,
    inspection: 0.12,
  };

  const byCategory = {} as Record<Category, number>;
  let totalWeight = 0;
  let weightedSum = 0;
  let lastAnswerTime = 0;

  for (const cat of categories) {
    const catQuestions = allQuestions.filter((q) => q.category === cat);
    const catQuestionIds = new Set(catQuestions.map((q) => q.id));

    // 直近30日の回答のみ対象（同じ問題は最新の回答のみ）
    const recentAnswers = allAnswers
      .filter(
        (a) =>
          catQuestionIds.has(a.questionId) && a.answeredAt > now - THIRTY_DAYS_MS
      )
      .sort((a, b) => b.answeredAt - a.answeredAt);

    // 同じ問題は最新の回答のみカウント
    const latestByQuestion = new Map<string, (typeof recentAnswers)[0]>();
    for (const ans of recentAnswers) {
      if (!latestByQuestion.has(ans.questionId)) {
        latestByQuestion.set(ans.questionId, ans);
      }
    }

    const uniqueAnswers = Array.from(latestByQuestion.values());

    if (uniqueAnswers.length === 0) {
      byCategory[cat] = 0;
      totalWeight += weights[cat];
      continue;
    }

    // 正答率
    const correctCount = uniqueAnswers.filter((a) => a.isCorrect).length;
    const accuracy = correctCount / uniqueAnswers.length;

    // カバー率（1回以上解いた問題数 / 全問題数）
    const answeredQuestionIds = new Set(
      allAnswers
        .filter((a) => catQuestionIds.has(a.questionId))
        .map((a) => a.questionId)
    );
    const coverage = Math.min(
      answeredQuestionIds.size / catQuestions.length,
      1
    );

    // 時間減衰（最後にこの分野を解いた時刻）
    const latestTime = Math.max(...uniqueAnswers.map((a) => a.answeredAt));
    const decay = timeDecay(latestTime);

    if (latestTime > lastAnswerTime) lastAnswerTime = latestTime;

    const power = Math.round(accuracy * coverage * decay * 100);
    byCategory[cat] = Math.min(power, 100);

    weightedSum += byCategory[cat] * weights[cat];
    totalWeight += weights[cat];
  }

  const overall =
    totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return {
    overall: Math.min(overall, 100),
    byCategory,
    totalAnswered: allAnswers.length,
    lastUpdated: now,
  };
}
