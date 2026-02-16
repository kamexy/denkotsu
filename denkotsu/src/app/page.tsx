"use client";

import { useEffect, useRef } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizResult } from "@/components/quiz/QuizResult";
import { SessionComplete } from "@/components/quiz/SessionComplete";

import { useMemo } from "react";
import { getAllQuestions } from "@/lib/questions";

export default function Home() {
  const {
    state,
    currentQuestion,
    selectedIndex,
    isCorrect,
    passPower,
    session,
    loadNext,
    answer,
    endSession,
    resetSession,
  } = useQuiz();

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadNext();
    }
  }, [loadNext]);

  const totalQuestions = useMemo(() => getAllQuestions().length, []);

  if (state === "complete") {
    return (
      <>
        <SessionComplete
          session={session}
          passPower={passPower}
          onRestart={resetSession}
        />
      </>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold text-gray-700">
              合格力 {passPower}%
            </span>
          </div>
          {session.totalAnswered > 0 && (
            <span className="text-xs text-gray-400">
              今回 {session.totalAnswered}問 ・ 正解率{" "}
              {Math.round(
                (session.correctCount / session.totalAnswered) * 100
              )}
              %
            </span>
          )}
          <span className="text-xs text-gray-400">
            Q.{session.totalAnswered + 1}/{totalQuestions}
          </span>
        </div>
      </header>

      {/* Quiz content */}
      <div className="pt-5">
        {state === "loading" && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {(state === "question" || state === "feedback") &&
          currentQuestion && (
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
                />
              )}
            </>
          )}

        {state === "error" && (
          <div className="flex flex-col items-center justify-center h-64 gap-4 px-4">
            <p className="text-sm text-gray-500">問題の読み込みに失敗しました</p>
            <button
              type="button"
              onClick={loadNext}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium"
            >
              再試行
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
