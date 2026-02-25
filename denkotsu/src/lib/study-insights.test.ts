import { describe, expect, it } from "vitest";
import { calculateStudyInsights } from "./study-insights";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function createLocalDayStart(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

describe("calculateStudyInsights", () => {
  it("回答がない場合に初期値を返す", () => {
    const now = new Date("2026-03-15T12:00:00").getTime();
    const result = calculateStudyInsights([], 0, 99, now);

    expect(result.totalStudyDays).toBe(0);
    expect(result.currentStreakDays).toBe(0);
    expect(result.studiedToday).toBe(false);
    expect(result.dailyGoal.goalQuestions).toBe(1);
    expect(result.weeklyReview.goalStudyDays).toBe(7);
    expect(result.weeklyReview.answered).toBe(0);
    expect(result.weeklyReview.correctRate).toBe(0);
  });

  it("連続学習日数と週次サマリを正しく計算する", () => {
    const nowDate = new Date("2026-03-15T12:00:00");
    const now = nowDate.getTime();
    const dayStart = createLocalDayStart(nowDate);

    const answers = [
      { answeredAt: dayStart + 10 * 60 * 1000, isCorrect: true },
      { answeredAt: dayStart - ONE_DAY_MS + 10 * 60 * 1000, isCorrect: false },
      { answeredAt: dayStart - 2 * ONE_DAY_MS + 10 * 60 * 1000, isCorrect: true },
      { answeredAt: dayStart - 12 * ONE_DAY_MS + 10 * 60 * 1000, isCorrect: true },
      { answeredAt: dayStart - 13 * ONE_DAY_MS + 10 * 60 * 1000, isCorrect: false },
    ];

    const result = calculateStudyInsights(answers, 5, 4, now);

    expect(result.totalStudyDays).toBe(5);
    expect(result.currentStreakDays).toBe(3);
    expect(result.studiedToday).toBe(true);

    expect(result.dailyGoal.goalQuestions).toBe(5);
    expect(result.dailyGoal.answeredToday).toBe(1);
    expect(result.dailyGoal.remainingQuestions).toBe(4);
    expect(result.dailyGoal.achieved).toBe(false);

    expect(result.weeklyReview.answered).toBe(3);
    expect(result.weeklyReview.correctCount).toBe(2);
    expect(result.weeklyReview.correctRate).toBe(67);
    expect(result.weeklyReview.activeDays).toBe(3);
    expect(result.weeklyReview.averagePerActiveDay).toBe(1);
    expect(result.weeklyReview.answeredDiffFromPreviousWeek).toBe(1);
    expect(result.weeklyReview.correctRateDiffFromPreviousWeek).toBe(17);
    expect(result.weeklyReview.activeDaysDiffFromPreviousWeek).toBe(1);
  });
});
