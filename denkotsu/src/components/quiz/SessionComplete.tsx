"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { db, getSettings } from "@/lib/db";
import { getAllQuestions } from "@/lib/questions";
import { calculateStudyInsights } from "@/lib/study-insights";
import {
  CATEGORY_LABELS,
  type Category,
  type QuizMode,
  type SessionStats,
} from "@/types";
import { AdSlot } from "@/components/ads/AdSlot";
import {
  getSessionCompleteAdSlot,
  shouldShowSessionCompleteAd,
} from "@/lib/ads";

interface SessionCompleteProps {
  session: SessionStats;
  passPower: number;
  onRestart: () => void;
  onRestartWithMode?: (mode: QuizMode) => void | Promise<void>;
}

const messages = [
  "おつかれさま！",
  "いい調子！",
  "ナイスファイト！",
  "また来てね！",
  "よく頑張った！",
];

export function SessionComplete({
  session,
  passPower,
  onRestart,
  onRestartWithMode,
}: SessionCompleteProps) {
  const [message] = useState(
    () => messages[Math.floor(Math.random() * messages.length)]
  );
  const [reviewSuggestion, setReviewSuggestion] = useState<{
    mode: QuizMode;
    message: string;
  } | null>(null);
  const [dailyGoalSuggestion, setDailyGoalSuggestion] = useState<string | null>(null);
  const correctRate =
    session.totalAnswered > 0
      ? Math.round((session.correctCount / session.totalAnswered) * 100)
      : 0;
  const diff = passPower - session.previousPassPower;
  const showBannerAd = shouldShowSessionCompleteAd(session.totalAnswered);
  const adSlot = getSessionCompleteAdSlot();
  const questionsById = useMemo(
    () => new Map(getAllQuestions().map((question) => [question.id, question])),
    []
  );

  useEffect(() => {
    let canceled = false;

    const loadSuggestion = async () => {
      if (session.totalAnswered <= 0) {
        if (!canceled) {
          setReviewSuggestion(null);
        }
        return;
      }

      try {
        const [sessionAnswers, allAnswers, settings] = await Promise.all([
          db.answers
          .where("answeredAt")
          .aboveOrEqual(session.startedAt)
          .toArray(),
          db.answers.toArray(),
          getSettings(),
        ]);
        if (canceled) return;

        const wrongCounts = new Map<Category, number>();
        for (const answer of sessionAnswers) {
          if (answer.isCorrect) continue;
          const question = questionsById.get(answer.questionId);
          if (!question) continue;
          wrongCounts.set(
            question.category,
            (wrongCounts.get(question.category) ?? 0) + 1
          );
        }

        if (wrongCounts.size === 0) {
          setReviewSuggestion({
            mode: "weak_category",
            message:
              "正解率が安定しています。次は「弱点カテゴリ特訓」で取りこぼしを潰すのがおすすめです。",
          });
        } else {
          const [weakestCategory, wrongCount] = [...wrongCounts.entries()].sort(
            (a, b) => b[1] - a[1]
          )[0];
          setReviewSuggestion({
            mode: "mistake_focus",
            message: `${CATEGORY_LABELS[weakestCategory]}で${wrongCount}問ミス。次は「ミスだけ復習」で定着させましょう。`,
          });
        }

        const insights = calculateStudyInsights(
          allAnswers,
          settings.dailyGoalQuestions,
          settings.weeklyGoalStudyDays
        );
        const remaining = insights.dailyGoal.remainingQuestions;
        if (remaining <= 0) {
          setDailyGoalSuggestion("今日の目標は達成済みです。余裕があれば弱点復習を1セット進めましょう。");
        } else {
          setDailyGoalSuggestion(`今日の目標まであと${remaining}問です。短時間で1セット進めるのがおすすめです。`);
        }
      } catch {
        if (!canceled) {
          setReviewSuggestion({
            mode: "mistake_focus",
            message: "次は「ミスだけ復習」で再挑戦すると定着しやすくなります。",
          });
          setDailyGoalSuggestion(null);
        }
      }
    };

    void loadSuggestion();
    return () => {
      canceled = true;
    };
  }, [questionsById, session.startedAt, session.totalAnswered]);

  const handleRestartBySuggestion = () => {
    if (reviewSuggestion && onRestartWithMode) {
      void onRestartWithMode(reviewSuggestion.mode);
      return;
    }
    onRestart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="panel w-full max-w-sm px-5 py-6 text-center">
        <p className="font-display text-3xl font-bold text-teal-800 mb-4">
          {message}
        </p>

        <div className="mb-6">
          <span className="text-base text-slate-500 font-medium">合格力</span>
          <div className="flex items-end justify-center gap-2 mt-1">
            <span className="font-display text-lg text-slate-400">
              {session.previousPassPower}%
            </span>
            <span className="text-slate-400 pb-1">→</span>
            <span className="font-display text-4xl font-bold text-teal-700 leading-none">
              {passPower}%
            </span>
            {diff > 0 && (
              <span className="text-base text-emerald-700 font-semibold pb-1">
                +{diff}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white/85 border border-slate-200 p-4 mb-5 text-left">
          <p className="text-base text-slate-500 mb-3 font-semibold">今回のまとめ</p>
          <div className="space-y-2 text-base">
            <div className="flex justify-between">
              <span className="text-slate-600">解いた問題</span>
              <span className="font-semibold text-slate-900">
                {session.totalAnswered}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">正解率</span>
              <span className="font-semibold text-slate-900">{correctRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">正解数</span>
              <span className="font-semibold text-slate-900">
                {session.correctCount}/{session.totalAnswered}
              </span>
            </div>
          </div>
        </div>

        {reviewSuggestion && (
          <div className="rounded-xl border border-teal-200 bg-[var(--primary-soft)]/65 p-4 mb-5 text-left">
            <p className="text-sm font-semibold tracking-wide text-teal-800 mb-2">
              次のおすすめ
            </p>
            <p className="text-base text-slate-700 leading-relaxed">
              {reviewSuggestion.message}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleRestartBySuggestion}
                className="flex-1 py-2.5 rounded-lg bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800 transition-colors"
                type="button"
              >
                {reviewSuggestion.mode === "mistake_focus"
                  ? "ミスだけ復習で再開"
                  : "弱点カテゴリ特訓で再開"}
              </button>
              <Link
                href="/settings"
                className="flex-1 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold text-center hover:bg-slate-50 transition-colors"
              >
                設定を開く
              </Link>
            </div>
          </div>
        )}

        {dailyGoalSuggestion && (
          <div className="rounded-xl border border-slate-200 bg-white/85 p-4 mb-5 text-left">
            <p className="text-sm font-semibold tracking-wide text-slate-600 mb-2">
              継続のヒント
            </p>
            <p className="text-base text-slate-700 leading-relaxed">
              {dailyGoalSuggestion}
            </p>
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl bg-teal-700 text-white font-semibold text-base hover:bg-teal-800 transition-colors"
          type="button"
        >
          またいつでもどうぞ
        </button>
      </div>
      {showBannerAd && (
        <AdSlot
          slot={adSlot}
          placement="session_complete"
          className="mt-3 w-full max-w-sm"
          context={{ sessionAnswered: session.totalAnswered }}
        />
      )}
    </motion.div>
  );
}
