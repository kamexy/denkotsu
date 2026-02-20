"use client";

import { useState, useCallback, useRef } from "react";
import type { AchievementDefinition, CollectionItem, Question, SessionStats } from "@/types";
import { selectNextQuestion, recordAnswer } from "@/lib/quiz-engine";
import { calculatePassPower } from "@/lib/pass-power";
import { tryDropCollectionItem } from "@/lib/collection";
import { unlockAchievements } from "@/lib/achievements";
import { triggerBackgroundSyncPush } from "@/lib/cloud-sync";

export type QuizState = "loading" | "question" | "feedback" | "complete" | "error";

export function useQuiz() {
  const [state, setState] = useState<QuizState>("loading");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [passPower, setPassPower] = useState(0);
  const [droppedItem, setDroppedItem] = useState<CollectionItem | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    AchievementDefinition[]
  >([]);
  const [session, setSession] = useState<SessionStats>(() => ({
    totalAnswered: 0,
    correctCount: 0,
    startedAt: Date.now(),
    previousPassPower: 0,
  }));
  const questionStartTime = useRef<number>(0);

  const loadNext = useCallback(async () => {
    setState("loading");
    try {
      const question = await selectNextQuestion();
      const pp = await calculatePassPower();
      setCurrentQuestion(question);
      setSelectedIndex(null);
      setIsCorrect(null);
      setDroppedItem(null);
      setUnlockedAchievements([]);
      setPassPower(pp.overall);
      setSession((s) => {
        if (s.totalAnswered === 0) {
          return { ...s, previousPassPower: pp.overall };
        }
        return s;
      });
      questionStartTime.current = Date.now();
      setState("question");
    } catch {
      setState("error");
    }
  }, []);

  const answer = useCallback(
    async (index: number) => {
      if (!currentQuestion || selectedIndex !== null) return;

      const timeSpent = questionStartTime.current > 0
        ? Date.now() - questionStartTime.current
        : 0;
      const correct = index === currentQuestion.correctIndex;

      setSelectedIndex(index);
      setIsCorrect(correct);
      setDroppedItem(null);
      setUnlockedAchievements([]);

      try {
        await recordAnswer(currentQuestion.id, correct, timeSpent);
        const drop = await tryDropCollectionItem(correct);
        const pp = await calculatePassPower();
        const unlocked = await unlockAchievements(pp);
        setPassPower(pp.overall);
        setDroppedItem(drop);
        setUnlockedAchievements(unlocked);
        triggerBackgroundSyncPush();
      } catch {
        // DB書き込み失敗でもフィードバック表示は継続
        setDroppedItem(null);
        setUnlockedAchievements([]);
      }

      setSession((s) => ({
        ...s,
        totalAnswered: s.totalAnswered + 1,
        correctCount: s.correctCount + (correct ? 1 : 0),
      }));

      setState("feedback");
    },
    [currentQuestion, selectedIndex]
  );

  const endSession = useCallback(() => {
    setState("complete");
  }, []);

  const resetSession = useCallback(() => {
    setSession({
      totalAnswered: 0,
      correctCount: 0,
      startedAt: Date.now(),
      previousPassPower: passPower,
    });
    loadNext();
  }, [loadNext, passPower]);

  return {
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
  };
}
