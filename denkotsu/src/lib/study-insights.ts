import type { AnswerRecord } from "@/types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type DailyGoalProgress = {
  goalQuestions: number;
  answeredToday: number;
  remainingQuestions: number;
  achieved: boolean;
};

export type WeeklyReviewSummary = {
  answered: number;
  correctCount: number;
  correctRate: number;
  activeDays: number;
  averagePerActiveDay: number;
  goalStudyDays: number;
  goalAchieved: boolean;
  answeredDiffFromPreviousWeek: number;
  correctRateDiffFromPreviousWeek: number;
  activeDaysDiffFromPreviousWeek: number;
};

export type StudyInsights = {
  totalStudyDays: number;
  currentStreakDays: number;
  studiedToday: boolean;
  lastStudiedAt: number | null;
  dailyGoal: DailyGoalProgress;
  weeklyReview: WeeklyReviewSummary;
};

function toDayStartTimestamp(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

type WindowMetrics = {
  answered: number;
  correctCount: number;
  activeDays: number;
};

function collectWindowMetrics(
  answers: Array<Pick<AnswerRecord, "answeredAt" | "isCorrect">>,
  windowStartAt: number,
  windowEndAtExclusive: number
): WindowMetrics {
  let answered = 0;
  let correctCount = 0;
  const daySet = new Set<number>();

  for (const answer of answers) {
    if (
      answer.answeredAt < windowStartAt ||
      answer.answeredAt >= windowEndAtExclusive
    ) {
      continue;
    }
    answered += 1;
    if (answer.isCorrect) correctCount += 1;
    daySet.add(toDayStartTimestamp(answer.answeredAt));
  }

  return {
    answered,
    correctCount,
    activeDays: daySet.size,
  };
}

function calculateCurrentStreakDays(
  dayStartsAsc: number[],
  nowDayStart: number
): number {
  if (dayStartsAsc.length === 0) return 0;
  const latestDayStart = dayStartsAsc[dayStartsAsc.length - 1];
  if (latestDayStart < nowDayStart - ONE_DAY_MS) {
    return 0;
  }

  let streak = 0;
  let cursor = latestDayStart;
  const daySet = new Set(dayStartsAsc);
  while (daySet.has(cursor)) {
    streak += 1;
    cursor -= ONE_DAY_MS;
  }
  return streak;
}

export function calculateStudyInsights(
  answers: Array<Pick<AnswerRecord, "answeredAt" | "isCorrect">>,
  dailyGoalQuestions: number,
  weeklyGoalStudyDays: number,
  now = Date.now()
): StudyInsights {
  const nowDayStart = toDayStartTimestamp(now);
  const currentWeekStart = nowDayStart - ONE_DAY_MS * 6;
  const currentWeekEndExclusive = nowDayStart + ONE_DAY_MS;
  const previousWeekStart = currentWeekStart - ONE_DAY_MS * 7;
  const previousWeekEndExclusive = currentWeekStart;

  const dayStartsSet = new Set<number>();
  let lastStudiedAt: number | null = null;
  let answeredToday = 0;

  for (const answer of answers) {
    const dayStart = toDayStartTimestamp(answer.answeredAt);
    dayStartsSet.add(dayStart);
    if (dayStart === nowDayStart) answeredToday += 1;
    if (lastStudiedAt === null || answer.answeredAt > lastStudiedAt) {
      lastStudiedAt = answer.answeredAt;
    }
  }

  const dayStartsAsc = [...dayStartsSet].sort((a, b) => a - b);
  const currentStreakDays = calculateCurrentStreakDays(dayStartsAsc, nowDayStart);

  const normalizedDailyGoal = Math.max(1, Math.round(dailyGoalQuestions));
  const normalizedWeeklyGoalDays = Math.min(
    7,
    Math.max(1, Math.round(weeklyGoalStudyDays))
  );

  const currentWeek = collectWindowMetrics(
    answers,
    currentWeekStart,
    currentWeekEndExclusive
  );
  const previousWeek = collectWindowMetrics(
    answers,
    previousWeekStart,
    previousWeekEndExclusive
  );

  const correctRate =
    currentWeek.answered > 0
      ? Math.round((currentWeek.correctCount / currentWeek.answered) * 100)
      : 0;
  const previousCorrectRate =
    previousWeek.answered > 0
      ? Math.round((previousWeek.correctCount / previousWeek.answered) * 100)
      : 0;

  return {
    totalStudyDays: dayStartsAsc.length,
    currentStreakDays,
    studiedToday: answeredToday > 0,
    lastStudiedAt,
    dailyGoal: {
      goalQuestions: normalizedDailyGoal,
      answeredToday,
      remainingQuestions: Math.max(0, normalizedDailyGoal - answeredToday),
      achieved: answeredToday >= normalizedDailyGoal,
    },
    weeklyReview: {
      answered: currentWeek.answered,
      correctCount: currentWeek.correctCount,
      correctRate,
      activeDays: currentWeek.activeDays,
      averagePerActiveDay:
        currentWeek.activeDays > 0
          ? Math.round(currentWeek.answered / currentWeek.activeDays)
          : 0,
      goalStudyDays: normalizedWeeklyGoalDays,
      goalAchieved: currentWeek.activeDays >= normalizedWeeklyGoalDays,
      answeredDiffFromPreviousWeek: currentWeek.answered - previousWeek.answered,
      correctRateDiffFromPreviousWeek: correctRate - previousCorrectRate,
      activeDaysDiffFromPreviousWeek:
        currentWeek.activeDays - previousWeek.activeDays,
    },
  };
}
