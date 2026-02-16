"use client";

import { usePassPower } from "@/hooks/usePassPower";
import { ProgressRing } from "@/components/common/ProgressRing";
import { CategoryBar } from "@/components/stats/CategoryBar";

import { ALL_CATEGORIES, type Category } from "@/types";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export default function StatsPage() {
  const { passPower, loading } = usePassPower();
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    (async () => {
      const answers = await db.answers.toArray();
      const days = new Set(
        answers.map((a) => new Date(a.answeredAt).toDateString())
      );
      setTotalDays(days.size);
    })();
  }, []);

  const pp = passPower;

  return (
    <div className="pb-20">
      <header className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">学習のきろく</h1>
      </header>

      <div className="px-4 py-6">
        {/* Overall ring */}
        <div className="flex justify-center mb-8">
          {loading ? (
            <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
          ) : (
            <ProgressRing value={pp?.overall ?? 0} />
          )}
        </div>

        {/* Status message */}
        {pp && (
          <p className="text-center text-sm text-gray-500 mb-6">
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

        {/* Category breakdown */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
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

        {/* Summary stats */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            これまでの学習
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">総回答数</span>
              <span className="font-semibold text-gray-900">
                {pp?.totalAnswered ?? 0}問
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">学習日数</span>
              <span className="font-semibold text-gray-900">{totalDays}日</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
