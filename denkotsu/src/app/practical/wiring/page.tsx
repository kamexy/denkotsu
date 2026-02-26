"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getPracticalWiringProblems } from "@/lib/practical";
import {
  readCandidateCompletedIds,
  writeCandidateCompletedIds,
} from "@/lib/practical-progress";

export default function PracticalWiringPage() {
  const problems = useMemo(() => getPracticalWiringProblems(), []);
  const [selectedId, setSelectedId] = useState<number>(problems[0]?.id ?? 1);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<number[]>(() =>
    readCandidateCompletedIds()
  );

  const selectedProblem =
    problems.find((problem) => problem.id === selectedId) ?? problems[0];

  if (!selectedProblem) return null;

  const totalSteps = selectedProblem.steps.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex >= totalSteps - 1;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);
  const done = completedIds.includes(selectedProblem.id);

  const toggleDone = () => {
    const next = done
      ? completedIds.filter((id) => id !== selectedProblem.id)
      : [...completedIds, selectedProblem.id];
    setCompletedIds(next);
    writeCandidateCompletedIds(next);
  };

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-teal-800">複線図ステップ練習</h1>
              <p className="text-sm text-slate-500 mt-1">候補13問を5ステップで手順化します。</p>
            </div>
            <Link
              href="/practical"
              className="text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              実技トップへ
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pt-3 space-y-3">
        <section className="panel p-4">
          <p className="text-sm font-semibold text-slate-700">問題を選択</p>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {problems.map((problem) => {
              const active = selectedId === problem.id;
              const completed = completedIds.includes(problem.id);
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(problem.id);
                    setStepIndex(0);
                  }}
                  className={`rounded-lg border px-2 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-teal-700 border-teal-700 text-white"
                      : completed
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  No.{problem.id}
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">{selectedProblem.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedProblem.focus}</p>
            </div>
            <button
              type="button"
              onClick={toggleDone}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                done
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {done ? "完了済み（解除）" : "この問題を完了"}
            </button>
          </div>

          <div className="diagram-surface mt-3 rounded-xl overflow-hidden border">
            <Image
              src={selectedProblem.singleLineImage}
              alt={`${selectedProblem.title} の単線図`}
              width={960}
              height={540}
              unoptimized
              className="diagram-image w-full h-auto"
            />
          </div>

          <div className="mt-3 h-2 rounded-full bg-teal-900/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">STEP {stepIndex + 1}/{totalSteps}</p>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white/85 p-3">
            <p className="text-sm font-semibold text-slate-700">今回の作業</p>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {selectedProblem.steps[stepIndex]}
            </p>
            <p className="mt-2 text-xs text-teal-700">Tip: {selectedProblem.tip}</p>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={isFirstStep}
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
            >
              前のステップ
            </button>
            <button
              type="button"
              disabled={isLastStep}
              onClick={() => setStepIndex((prev) => Math.min(totalSteps - 1, prev + 1))}
              className="rounded-lg border border-teal-700 bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              次のステップ
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
