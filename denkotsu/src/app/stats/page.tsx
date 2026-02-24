"use client";

import { usePassPower } from "@/hooks/usePassPower";
import { ProgressRing } from "@/components/common/ProgressRing";
import { CategoryBar } from "@/components/stats/CategoryBar";
import { AdSlot } from "@/components/ads/AdSlot";

import { ALL_CATEGORIES, type Category } from "@/types";
import { useEffect, useState } from "react";
import { db, getSettings } from "@/lib/db";
import { getStatsAdSlot, isAdsenseEnabled } from "@/lib/ads";
import {
  calculateStudyInsights,
  type StudyInsights,
} from "@/lib/study-insights";

export default function StatsPage() {
  const { passPower, loading } = usePassPower();
  const [insights, setInsights] = useState<StudyInsights | null>(null);
  const showStatsAd = isAdsenseEnabled();
  const statsAdSlot = getStatsAdSlot();

  useEffect(() => {
    (async () => {
      const [answers, settings] = await Promise.all([
        db.answers.toArray(),
        getSettings(),
      ]);
      setInsights(
        calculateStudyInsights(
          answers,
          settings.dailyGoalQuestions,
          settings.weeklyGoalStudyDays
        )
      );
    })();
  }, []);

  const pp = passPower;
  const dailyGoal = insights?.dailyGoal;
  const weeklyReview = insights?.weeklyReview;
  const streakDays = insights?.currentStreakDays ?? 0;
  const streakLabel =
    streakDays > 0
      ? `${streakDays}日連続`
      : insights?.studiedToday
        ? "今日から開始"
        : "連続記録なし";
  const weeklyAnsweredDiff = weeklyReview?.answeredDiffFromPreviousWeek ?? 0;
  const weeklyCorrectRateDiff = weeklyReview?.correctRateDiffFromPreviousWeek ?? 0;
  const weeklyDaysDiff = weeklyReview?.activeDaysDiffFromPreviousWeek ?? 0;

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <h1 className="font-display text-2xl font-bold text-teal-800">学習のきろく</h1>
        </div>
      </header>

      <div className="px-4 py-5">
        {/* Overall ring */}
        <div className="panel flex justify-center mb-4 py-5">
          {loading ? (
            <div className="w-40 h-40 rounded-full bg-slate-100 animate-pulse" />
          ) : (
            <ProgressRing value={pp?.overall ?? 0} />
          )}
        </div>

        {/* Status message */}
        {pp && (
          <p className="text-center text-base text-slate-600 mb-5 font-medium">
            {pp.overall >= 80
              ? "合格圏内！"
              : pp.overall >= 60
                ? "合格が見えてきた！"
                : pp.overall >= 30
                  ? "順調に成長中"
                  : pp.totalAnswered === 0
                    ? "問題を解いてみましょう"
                    : "まだまだこれから"}
          </p>
        )}

        {showStatsAd && (
          <AdSlot
            slot={statsAdSlot}
            placement="stats_page"
            className="mb-4 w-full"
          />
        )}

        <div className="grid gap-3 sm:grid-cols-2 mb-4">
          <div className="panel p-4">
            <h2 className="text-base font-semibold text-slate-700 tracking-wide mb-2">
              連続学習
            </h2>
            <p className="font-display text-2xl font-bold text-teal-700">{streakLabel}</p>
            <p className="mt-1 text-sm text-slate-500">
              累計学習日数: {insights?.totalStudyDays ?? 0}日
            </p>
          </div>

          <div className="panel p-4">
            <h2 className="text-base font-semibold text-slate-700 tracking-wide mb-2">
              今日の目標
            </h2>
            <p className="font-display text-2xl font-bold text-teal-700">
              {dailyGoal?.answeredToday ?? 0}/{dailyGoal?.goalQuestions ?? 0}問
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {dailyGoal?.achieved
                ? "目標達成済みです。"
                : `あと${dailyGoal?.remainingQuestions ?? 0}問で達成`}
            </p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="panel p-4 mb-4">
          <h2 className="text-base font-semibold text-slate-700 mb-4 tracking-wide">
            分野べつ
          </h2>
          <div className="space-y-3">
            {ALL_CATEGORIES.map((cat) => (
              <CategoryBar
                key={cat}
                category={cat as Category}
                value={pp?.byCategory[cat as Category] ?? 0}
              />
            ))}
          </div>
        </div>

        <div className="panel p-5 mb-4">
          <h2 className="text-base font-semibold text-slate-700 mb-3 tracking-wide">
            週次ふりかえり
          </h2>
          <div className="space-y-2.5 text-base">
            <div className="flex justify-between">
              <span className="text-slate-500">解いた問題（7日）</span>
              <span className="font-semibold text-slate-900">
                {weeklyReview?.answered ?? 0}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">正解率（7日）</span>
              <span className="font-semibold text-slate-900">
                {weeklyReview?.correctRate ?? 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">学習日数（7日）</span>
              <span className="font-semibold text-slate-900">
                {weeklyReview?.activeDays ?? 0}/{weeklyReview?.goalStudyDays ?? 0}日
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">1学習日あたり</span>
              <span className="font-semibold text-slate-900">
                {weeklyReview?.averagePerActiveDay ?? 0}問
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            前週比:
            <span
              className={`ml-1 font-semibold ${
                weeklyAnsweredDiff >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              問題数 {weeklyAnsweredDiff >= 0 ? "+" : ""}
              {weeklyAnsweredDiff}問
            </span>
            ・
            <span
              className={`ml-1 font-semibold ${
                weeklyCorrectRateDiff >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              正解率 {weeklyCorrectRateDiff >= 0 ? "+" : ""}
              {weeklyCorrectRateDiff}%
            </span>
            ・
            <span
              className={`ml-1 font-semibold ${
                weeklyDaysDiff >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              学習日数 {weeklyDaysDiff >= 0 ? "+" : ""}
              {weeklyDaysDiff}日
            </span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {weeklyReview?.goalAchieved
              ? "今週の学習日数目標を達成しています。"
              : `今週の目標まであと${Math.max(0, (weeklyReview?.goalStudyDays ?? 0) - (weeklyReview?.activeDays ?? 0))}日`}
          </p>
        </div>

        {/* Summary stats */}
        <div className="panel p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-3 tracking-wide">
            これまでの学習
          </h2>
          <div className="space-y-2.5 text-base">
            <div className="flex justify-between">
              <span className="text-slate-500">総回答数</span>
              <span className="font-semibold text-slate-900">
                {pp?.totalAnswered ?? 0}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">学習日数</span>
              <span className="font-semibold text-slate-900">
                {insights?.totalStudyDays ?? 0}日
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
