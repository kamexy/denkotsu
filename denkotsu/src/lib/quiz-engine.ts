import { db } from "./db";
import { getAllQuestions } from "./questions";
import type { Category, Question, SpacedRepetition } from "@/types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_CATEGORY_WINDOW = 10;
const RECENT_QUESTION_WINDOW = 5;
const MAX_SAME_CATEGORY_IN_WINDOW = 3;
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
type QuestionType = NonNullable<Question["questionType"]>;

export type SelectNextQuestionOptions = {
  fixedQuestionType?: QuestionType;
};

function normalizeQuestionType(question: Question): QuestionType {
  return question.questionType ?? "multiple_choice";
}

function filterByQuestionType(
  questions: Question[],
  questionType?: QuestionType
): Question[] {
  if (!questionType) return questions;
  return questions.filter(
    (question) => normalizeQuestionType(question) === questionType
  );
}

function createDefaultSpacedState(
  questionId: string,
  now: number
): SpacedRepetition {
  return {
    questionId,
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    nextReviewAt: now,
    repetitionCount: 0,
    lastAnsweredAt: now,
  };
}

function calculateQuality(isCorrect: boolean, timeSpentMs: number): number {
  if (!isCorrect) return 1;

  if (timeSpentMs <= 5000) return 5;
  if (timeSpentMs <= 15000) return 4;
  return 3;
}

function updateSpacedRepetition(
  current: SpacedRepetition,
  quality: number,
  now: number
): SpacedRepetition {
  let { easeFactor, intervalDays, repetitionCount } = current;

  if (quality >= 3) {
    if (repetitionCount === 0) {
      intervalDays = 1;
    } else if (repetitionCount === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
    repetitionCount += 1;
  } else {
    repetitionCount = 0;
    intervalDays = 0;
  }

  const penalty = 5 - quality;
  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - penalty * (0.08 + penalty * 0.02))
  );

  return {
    ...current,
    easeFactor,
    intervalDays,
    repetitionCount,
    nextReviewAt: now + intervalDays * ONE_DAY_MS,
    lastAnsweredAt: now,
  };
}

function getRecentCategoryCounts(
  answers: Array<{ questionId: string; answeredAt: number }>,
  questionById: Map<string, Question>
): Map<Category, number> {
  const recentAnswers = [...answers]
    .sort((a, b) => b.answeredAt - a.answeredAt)
    .slice(0, RECENT_CATEGORY_WINDOW);

  const counts = new Map<Category, number>();
  for (const answer of recentAnswers) {
    const question = questionById.get(answer.questionId);
    if (!question) continue;
    counts.set(question.category, (counts.get(question.category) ?? 0) + 1);
  }
  return counts;
}

function getRecentQuestionIds(
  answers: Array<{ questionId: string; answeredAt: number }>
): Set<string> {
  return new Set(
    [...answers]
      .sort((a, b) => b.answeredAt - a.answeredAt)
      .slice(0, RECENT_QUESTION_WINDOW)
      .map((answer) => answer.questionId)
  );
}

function applyQuestionFilters(
  questions: Question[],
  recentQuestionIds: Set<string>,
  recentCategoryCounts: Map<Category, number>
): Question[] {
  const nonRecent =
    questions.filter((question) => !recentQuestionIds.has(question.id)) ||
    questions;
  const basePool = nonRecent.length > 0 ? nonRecent : questions;

  const balanced = basePool.filter(
    (question) =>
      (recentCategoryCounts.get(question.category) ?? 0) <
      MAX_SAME_CATEGORY_IN_WINDOW
  );
  return balanced.length > 0 ? balanced : basePool;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickFromPrioritized(
  questions: Question[],
  recentQuestionIds: Set<string>,
  recentCategoryCounts: Map<Category, number>,
  topK: number
): Question | null {
  if (questions.length === 0) return null;
  const filtered = applyQuestionFilters(
    questions,
    recentQuestionIds,
    recentCategoryCounts
  );
  const top = filtered.slice(0, Math.min(topK, filtered.length));
  return pickRandom(top);
}

function calculateCategoryWeakness(
  allQuestions: Question[],
  allAnswers: Array<{ questionId: string; isCorrect: boolean; answeredAt: number }>
): Map<Category, number> {
  const weaknessByCategory = new Map<Category, number>();
  const categories = new Set(allQuestions.map((question) => question.category));

  for (const category of categories) {
    const categoryQuestionIds = new Set(
      allQuestions
        .filter((question) => question.category === category)
        .map((question) => question.id)
    );
    const totalQuestions = categoryQuestionIds.size;
    if (totalQuestions === 0) {
      weaknessByCategory.set(category, 1);
      continue;
    }

    const latestByQuestion = new Map<string, (typeof allAnswers)[number]>();
    const categoryAnswers = allAnswers
      .filter((answer) => categoryQuestionIds.has(answer.questionId))
      .sort((a, b) => b.answeredAt - a.answeredAt);

    for (const answer of categoryAnswers) {
      if (!latestByQuestion.has(answer.questionId)) {
        latestByQuestion.set(answer.questionId, answer);
      }
    }

    const latestAnswers = Array.from(latestByQuestion.values());
    const answeredCount = latestAnswers.length;
    const correctCount = latestAnswers.filter((answer) => answer.isCorrect).length;
    const accuracy = answeredCount > 0 ? correctCount / answeredCount : 0;
    const coverage = answeredCount / totalQuestions;
    const estimatedStrength = accuracy * coverage;
    const weakness = Math.max(0.1, 1 - estimatedStrength);

    weaknessByCategory.set(category, weakness);
  }

  return weaknessByCategory;
}

function pickWeightedByCategoryWeakness(
  questions: Question[],
  weaknessByCategory: Map<Category, number>
): Question {
  let totalWeight = 0;
  const weighted = questions.map((question) => {
    const weight = weaknessByCategory.get(question.category) ?? 1;
    totalWeight += weight;
    return { question, weight };
  });

  if (totalWeight <= 0) return pickRandom(questions);

  let cursor = Math.random() * totalWeight;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) return item.question;
  }

  return weighted[weighted.length - 1].question;
}

/**
 * 次に出題する問題を選択する
 *
 * 優先度:
 * 1. nextReviewAt を過ぎた復習問題（期限超過が長い順）
 * 2. 未回答問題（弱点分野を優先）
 * 3. 定着が弱い問題（intervalDays が短い順）
 */
export async function selectNextQuestion(
  options: SelectNextQuestionOptions = {}
): Promise<Question> {
  const allQuestions = getAllQuestions();
  const filteredQuestions = filterByQuestionType(
    allQuestions,
    options.fixedQuestionType
  );
  const questionPool =
    filteredQuestions.length > 0 ? filteredQuestions : allQuestions;
  const [allAnswers, spacedRecords] = await Promise.all([
    db.answers.toArray(),
    db.spacedRepetition.toArray(),
  ]);
  const now = Date.now();

  const questionById = new Map(
    questionPool.map((question) => [question.id, question])
  );
  const recentCategoryCounts = getRecentCategoryCounts(allAnswers, questionById);
  const recentQuestionIds = getRecentQuestionIds(allAnswers);
  const answeredIds = new Set(allAnswers.map((answer) => answer.questionId));
  const spacedById = new Map(spacedRecords.map((record) => [record.questionId, record]));

  // Step 1: 期限超過の復習問題を優先
  const dueQuestions = questionPool
    .filter((question) => {
      const spaced = spacedById.get(question.id);
      return spaced ? spaced.nextReviewAt <= now : false;
    })
    .sort((a, b) => {
      const aSpaced = spacedById.get(a.id);
      const bSpaced = spacedById.get(b.id);
      const aOverdue = aSpaced ? now - aSpaced.nextReviewAt : 0;
      const bOverdue = bSpaced ? now - bSpaced.nextReviewAt : 0;
      if (bOverdue !== aOverdue) return bOverdue - aOverdue;

      const aInterval = aSpaced?.intervalDays ?? 0;
      const bInterval = bSpaced?.intervalDays ?? 0;
      return aInterval - bInterval;
    });

  const dueCandidate = pickFromPrioritized(
    dueQuestions,
    recentQuestionIds,
    recentCategoryCounts,
    6
  );
  if (dueCandidate) return dueCandidate;

  // Step 2: 未回答問題（弱点分野優先）
  const unansweredQuestions = questionPool.filter(
    (question) => !answeredIds.has(question.id)
  );
  if (unansweredQuestions.length > 0) {
    const filteredUnanswered = applyQuestionFilters(
      unansweredQuestions,
      recentQuestionIds,
      recentCategoryCounts
    );
    const weaknessByCategory = calculateCategoryWeakness(questionPool, allAnswers);
    return pickWeightedByCategoryWeakness(filteredUnanswered, weaknessByCategory);
  }

  // Step 3: 定着が弱い問題を優先
  const lastAnsweredById = new Map<string, number>();
  for (const answer of allAnswers) {
    const prev = lastAnsweredById.get(answer.questionId) ?? 0;
    if (answer.answeredAt > prev) {
      lastAnsweredById.set(answer.questionId, answer.answeredAt);
    }
  }

  const weakestQuestions = [...questionPool].sort((a, b) => {
    const aSpaced = spacedById.get(a.id);
    const bSpaced = spacedById.get(b.id);
    const aInterval = aSpaced?.intervalDays ?? 0;
    const bInterval = bSpaced?.intervalDays ?? 0;
    if (aInterval !== bInterval) return aInterval - bInterval;

    const aLast = aSpaced?.lastAnsweredAt ?? lastAnsweredById.get(a.id) ?? 0;
    const bLast = bSpaced?.lastAnsweredAt ?? lastAnsweredById.get(b.id) ?? 0;
    return aLast - bLast;
  });

  const weakestCandidate = pickFromPrioritized(
    weakestQuestions,
    recentQuestionIds,
    recentCategoryCounts,
    10
  );
  if (weakestCandidate) return weakestCandidate;

  return pickRandom(questionPool);
}

/**
 * 回答を記録する
 */
export async function recordAnswer(
  questionId: string,
  isCorrect: boolean,
  timeSpentMs: number
): Promise<void> {
  const answeredAt = Date.now();
  const normalizedTimeSpent =
    Number.isFinite(timeSpentMs) && timeSpentMs > 0 ? Math.round(timeSpentMs) : 0;

  await db.transaction("rw", db.answers, db.spacedRepetition, async () => {
    await db.answers.add({
      questionId,
      isCorrect,
      answeredAt,
      timeSpentMs: normalizedTimeSpent,
    });

    const current = await db.spacedRepetition.get(questionId);
    const base = current ?? createDefaultSpacedState(questionId, answeredAt);
    const quality = calculateQuality(isCorrect, normalizedTimeSpent);
    const next = updateSpacedRepetition(base, quality, answeredAt);
    await db.spacedRepetition.put(next);
  });
}
