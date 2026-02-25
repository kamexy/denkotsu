import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Question, SpacedRepetition } from "@/types";

const mocks = vi.hoisted(() => ({
  answersToArray: vi.fn(),
  answersAdd: vi.fn(),
  spacedToArray: vi.fn(),
  spacedGet: vi.fn(),
  spacedPut: vi.fn(),
  transaction: vi.fn(async (_mode: unknown, _answers: unknown, _spaced: unknown, cb: () => Promise<void>) => {
    await cb();
  }),
  getAllQuestions: vi.fn(),
}));

vi.mock("./db", () => ({
  db: {
    answers: {
      toArray: mocks.answersToArray,
      add: mocks.answersAdd,
    },
    spacedRepetition: {
      toArray: mocks.spacedToArray,
      get: mocks.spacedGet,
      put: mocks.spacedPut,
    },
    transaction: mocks.transaction,
  },
}));

vi.mock("./questions", () => ({
  getAllQuestions: mocks.getAllQuestions,
}));

import { recordAnswer, selectNextQuestion } from "./quiz-engine";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function createQuestion(
  id: string,
  category: Question["category"],
  questionType?: Question["questionType"]
): Question {
  return {
    id,
    category,
    question: `設問 ${id}`,
    options:
      questionType === "true_false"
        ? ["正しい", "誤り"]
        : ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
    correctIndex: 0,
    explanation: "解説文は検証ルールを満たすため十分な長さを確保しています。",
    questionType,
  };
}

function createSpaced(
  questionId: string,
  intervalDays: number,
  nextReviewAt: number,
  lastAnsweredAt: number
): SpacedRepetition {
  return {
    questionId,
    easeFactor: 2.5,
    intervalDays,
    nextReviewAt,
    repetitionCount: Math.max(1, intervalDays),
    lastAnsweredAt,
  };
}

describe("selectNextQuestion", () => {
  beforeEach(() => {
    mocks.answersToArray.mockReset();
    mocks.spacedToArray.mockReset();
    mocks.getAllQuestions.mockReset();
    vi.restoreAllMocks();
  });

  it("期限超過の復習問題を優先する", async () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    mocks.getAllQuestions.mockReturnValue([
      createQuestion("q1", "electrical_theory"),
      createQuestion("q2", "laws"),
    ]);
    mocks.answersToArray.mockResolvedValue([
      { questionId: "q1", isCorrect: true, answeredAt: now - 9_000, timeSpentMs: 5_000 },
      { questionId: "q2", isCorrect: true, answeredAt: now - 1_000, timeSpentMs: 5_000 },
    ]);
    mocks.spacedToArray.mockResolvedValue([
      createSpaced("q1", 1, now - ONE_DAY_MS, now - 9_000),
      createSpaced("q2", 5, now + ONE_DAY_MS, now - 1_000),
    ]);

    const selected = await selectNextQuestion({ repeatDelayQuestions: 0 });
    expect(selected.id).toBe("q1");
  });

  it("未回答問題を優先して出題する", async () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    mocks.getAllQuestions.mockReturnValue([
      createQuestion("q1", "electrical_theory"),
      createQuestion("q2", "laws"),
    ]);
    mocks.answersToArray.mockResolvedValue([
      { questionId: "q1", isCorrect: true, answeredAt: now - 1_000, timeSpentMs: 5_000 },
    ]);
    mocks.spacedToArray.mockResolvedValue([]);

    const selected = await selectNextQuestion({ repeatDelayQuestions: 0 });
    expect(selected.id).toBe("q2");
  });

  it("直前に回答した問題を連続出題しない", async () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    mocks.getAllQuestions.mockReturnValue([
      createQuestion("q1", "electrical_theory"),
      createQuestion("q2", "laws"),
    ]);
    mocks.answersToArray.mockResolvedValue([
      { questionId: "q2", isCorrect: true, answeredAt: now - 4_000, timeSpentMs: 5_000 },
      { questionId: "q1", isCorrect: true, answeredAt: now - 1_000, timeSpentMs: 5_000 },
    ]);
    mocks.spacedToArray.mockResolvedValue([
      createSpaced("q1", 1, now + ONE_DAY_MS, now - 1_000),
      createSpaced("q2", 5, now + ONE_DAY_MS, now - 4_000),
    ]);

    const selected = await selectNextQuestion({ repeatDelayQuestions: 0 });
    expect(selected.id).toBe("q2");
  });

  it("questionType固定時は対象タイプのみから出題する", async () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    mocks.getAllQuestions.mockReturnValue([
      createQuestion("q1", "electrical_theory", "true_false"),
      createQuestion("q2", "laws", "multiple_choice"),
    ]);
    mocks.answersToArray.mockResolvedValue([]);
    mocks.spacedToArray.mockResolvedValue([]);

    const selected = await selectNextQuestion({
      fixedQuestionType: "true_false",
      repeatDelayQuestions: 0,
    });
    expect(selected.id).toBe("q1");
  });
});

describe("recordAnswer", () => {
  beforeEach(() => {
    mocks.answersAdd.mockReset();
    mocks.spacedGet.mockReset();
    mocks.spacedPut.mockReset();
    mocks.transaction.mockClear();
    vi.restoreAllMocks();
  });

  it("初回正解時にspaced repetitionを更新する", async () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);
    mocks.spacedGet.mockResolvedValue(undefined);

    await recordAnswer("q100", true, 4_000);

    expect(mocks.answersAdd).toHaveBeenCalledTimes(1);
    expect(mocks.answersAdd).toHaveBeenCalledWith({
      questionId: "q100",
      isCorrect: true,
      answeredAt: now,
      timeSpentMs: 4_000,
    });
    expect(mocks.spacedPut).toHaveBeenCalledTimes(1);
    expect(mocks.spacedPut).toHaveBeenCalledWith(
      expect.objectContaining({
        questionId: "q100",
        intervalDays: 1,
        repetitionCount: 1,
        nextReviewAt: now + ONE_DAY_MS,
        lastAnsweredAt: now,
      })
    );
  });
});
