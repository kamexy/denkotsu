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
              <span className="font-semibold text-slate-900">{totalDays}日</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
