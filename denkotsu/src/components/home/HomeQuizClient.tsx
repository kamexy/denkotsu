"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";
import { SessionComplete } from "@/components/quiz/SessionComplete";
import type { Question } from "@/types";
import { getAllQuestions } from "@/lib/questions";

const DEBUG_QUESTION_TYPES: Array<NonNullable<Question["questionType"]>> = [
  "multiple_choice",
  "true_false",
  "image_tap",
];

export function HomeQuizClient() {
  const [fixedQuestionType] = useState<
    NonNullable<Question["questionType"]> | undefined
  >(() => {
    if (typeof window === "undefined") return undefined;
    const raw = new URLSearchParams(window.location.search).get("debugQuestionType");
    if (!raw) return undefined;
    return DEBUG_QUESTION_TYPES.find((type) => type === raw);
  });

  const {
    state,
    currentQuestion,
    selectedIndex,
    isCorrect,
    passPower,
    droppedItem,
    unlockedAchievements,
    session,
    loadNext,
    answer,
    endSession,
    resetSession,
    restartWithMode,
  } = useQuiz({ fixedQuestionType });

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadNext();
    }
  }, [loadNext]);

  const totalQuestions = useMemo(() => getAllQuestions().length, []);
  const correctRate =
    session.totalAnswered > 0
      ? Math.round((session.correctCount / session.totalAnswered) * 100)
      : 0;

  if (state === "complete") {
    return (
      <SessionComplete
        session={session}
        passPower={passPower}
        onRestart={resetSession}
        onRestartWithMode={restartWithMode}
      />
    );
  }

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-40 px-4 pt-3 pb-2 backdrop-blur-sm">
        <div className="panel px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.12em] text-slate-500">
                PASS POWER
              </p>
              <p className="font-display text-2xl font-bold text-teal-800">
                {passPower}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-slate-500">進行</p>
              <p className="font-display text-lg font-semibold text-slate-700">
                Q.{session.totalAnswered + 1}/{totalQuestions}
              </p>
            </div>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-teal-900/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-500"
              style={{ width: `${passPower}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {session.totalAnswered > 0
              ? `今回 ${session.totalAnswered}問 ・ 正解率 ${correctRate}%`
              : "まずは1問、10秒でスタート"}
          </p>
        </div>
      </header>

      <div className="pt-3">
        {state === "loading" && (
          <div className="flex h-64 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-teal-700 border-t-transparent" />
          </div>
        )}

        {(state === "question" || state === "feedback") && currentQuestion && (
          <>
            <QuizCard
              question={currentQuestion}
              selectedIndex={selectedIndex}
              isCorrect={isCorrect}
              onSelect={answer}
            />
            {state === "feedback" && isCorrect !== null && (
              <QuizResult
                question={currentQuestion}
                isCorrect={isCorrect}
                onNext={loadNext}
                onEnd={endSession}
                droppedItem={droppedItem}
                unlockedAchievements={unlockedAchievements}
                totalAnswered={session.totalAnswered}
              />
            )}
          </>
        )}

        {state === "error" && (
          <div className="px-4">
            <div className="panel flex h-64 flex-col items-center justify-center gap-4">
              <p className="text-base text-slate-600">問題の読み込みに失敗しました</p>
              <button
                type="button"
                onClick={loadNext}
                className="rounded-lg bg-teal-700 px-4 py-2 text-base font-semibold text-white hover:bg-teal-800"
              >
                再試行
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
