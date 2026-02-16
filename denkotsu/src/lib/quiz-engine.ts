import { db } from "./db";
import { getAllQuestions } from "./questions";
import type { Question, Category, ALL_CATEGORIES } from "@/types";

/**
 * 次に出題する問題を選択する
 *
 * 優先度:
 * 1. まだ一度も解いていない問題（分野バランスを考慮）
 * 2. 過去に間違えた問題（間違えた回数が多い順）
 * 3. 最後に解いてから時間が経った問題
 */
export async function selectNextQuestion(): Promise<Question> {
  const allQuestions = getAllQuestions();
  const allAnswers = await db.answers.toArray();

  // 直近10問の分野を取得（同じ分野の連続を防ぐ）
  const recentAnswers = allAnswers
    .sort((a, b) => b.answeredAt - a.answeredAt)
    .slice(0, 10);
  const recentCategoryCounts = new Map<string, number>();
  for (const ans of recentAnswers) {
    const q = allQuestions.find((q) => q.id === ans.questionId);
    if (q) {
      recentCategoryCounts.set(
        q.category,
        (recentCategoryCounts.get(q.category) || 0) + 1
      );
    }
  }

  // 回答済みの問題IDセット
  const answeredIds = new Set(allAnswers.map((a) => a.questionId));

  // Step 1: 未回答の問題
  const unanswered = allQuestions.filter((q) => !answeredIds.has(q.id));
  if (unanswered.length > 0) {
    // 直近10問で3回以上出た分野を除外（可能なら）
    const filtered = unanswered.filter(
      (q) => (recentCategoryCounts.get(q.category) || 0) < 3
    );
    const pool = filtered.length > 0 ? filtered : unanswered;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Step 2: 間違えた問題
  const incorrectCounts = new Map<string, number>();
  const lastAnswerTime = new Map<string, number>();
  for (const ans of allAnswers) {
    if (!ans.isCorrect) {
      incorrectCounts.set(
        ans.questionId,
        (incorrectCounts.get(ans.questionId) || 0) + 1
      );
    }
    const prev = lastAnswerTime.get(ans.questionId) || 0;
    if (ans.answeredAt > prev) {
      lastAnswerTime.set(ans.questionId, ans.answeredAt);
    }
  }

  // 間違えた問題を間違い回数の降順でソート
  const incorrectQuestions = allQuestions
    .filter((q) => (incorrectCounts.get(q.id) || 0) > 0)
    .sort((a, b) => {
      const countDiff =
        (incorrectCounts.get(b.id) || 0) - (incorrectCounts.get(a.id) || 0);
      if (countDiff !== 0) return countDiff;
      // 同じ間違い回数なら、最後に解いてから時間が経った順
      return (
        (lastAnswerTime.get(a.id) || 0) - (lastAnswerTime.get(b.id) || 0)
      );
    });

  if (incorrectQuestions.length > 0) {
    // 上位5問からランダム
    const top = incorrectQuestions.slice(0, 5);
    return top[Math.floor(Math.random() * top.length)];
  }

  // Step 3: すべて正解済み → 最後に解いてから最も時間が経った問題
  const sorted = [...allQuestions].sort(
    (a, b) =>
      (lastAnswerTime.get(a.id) || 0) - (lastAnswerTime.get(b.id) || 0)
  );

  // 上位10問からランダム
  const top = sorted.slice(0, 10);
  return top[Math.floor(Math.random() * top.length)];
}

/**
 * 回答を記録する
 */
export async function recordAnswer(
  questionId: string,
  isCorrect: boolean,
  timeSpentMs: number
): Promise<void> {
  await db.answers.add({
    questionId,
    isCorrect,
    answeredAt: Date.now(),
    timeSpentMs,
  });
}
