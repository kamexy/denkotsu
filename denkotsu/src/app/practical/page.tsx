"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getPracticalWiringProblems } from "@/lib/practical";
import {
  readCandidateCompletedIds,
  writeCandidateCompletedIds,
} from "@/lib/practical-progress";

export default function PracticalPage() {
  const [completedCandidateIds, setCompletedCandidateIds] = useState<number[]>(() =>
    readCandidateCompletedIds()
  );
  const wiringProblems = useMemo(() => getPracticalWiringProblems(), []);

  const candidateDoneCount = completedCandidateIds.length;
  const candidateTotalCount = wiringProblems.length;
  const candidateProgress =
    candidateTotalCount > 0
      ? Math.round((candidateDoneCount / candidateTotalCount) * 100)
      : 0;

  const toggleCandidate = (id: number) => {
    const next = completedCandidateIds.includes(id)
      ? completedCandidateIds.filter((candidateId) => candidateId !== id)
      : [...completedCandidateIds, id];
    setCompletedCandidateIds(next);
    writeCandidateCompletedIds(next);
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <h1 className="font-display text-2xl font-bold text-teal-800">技能試験対策</h1>
          <p className="text-sm text-slate-500 mt-1">
            候補13問を軸に、複線図練習と欠陥判定で実戦力を高めます。
          </p>
        </div>
      </header>

      <main className="px-4 pt-3 space-y-3">
        <section className="panel p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">候補問題 進捗</p>
              <p className="mt-1 text-2xl font-display font-bold text-teal-800">
                {candidateDoneCount}/{candidateTotalCount}
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-600">達成率 {candidateProgress}%</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-teal-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-300"
              style={{ width: `${candidateProgress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            本番は13問から1問出題。13問すべての手順を把握すると安定します。
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-700">学習メニュー</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <MenuCard
              href="/practical/wiring"
              title="複線図ステップ練習"
              description="候補13問を5ステップで整理"
            />
            <MenuCard
              href="/practical/defects"
              title="欠陥判定クイズ"
              description="合格/欠陥の見分けを鍛える"
            />
            <MenuCard
              href="/practical/timeline"
              title="40分タイムライン練習"
              description="試験当日の時間配分を体で覚える"
            />
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-700">候補13問チェック</h2>
          <p className="mt-1 text-sm text-slate-500">完了した問題をタップして記録します。</p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {wiringProblems.map((problem) => {
              const done = completedCandidateIds.includes(problem.id);
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => toggleCandidate(problem.id)}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors ${
                    done
                      ? "bg-teal-700 border-teal-700 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  No.{problem.id}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function MenuCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white/85 p-3 transition-colors hover:bg-white"
    >
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
    </Link>
  );
}
