"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPracticalWiringProblems } from "@/lib/practical";
import {
  formatClock,
  PRACTICAL_TIMELINE_PHASES,
  PRACTICAL_TIMELINE_TOTAL_SECONDS,
  toSeconds,
} from "@/lib/practical-timeline";

export default function PracticalTimelinePage() {
  const problems = useMemo(() => getPracticalWiringProblems(), []);
  const phaseTargetSeconds = useMemo(
    () => PRACTICAL_TIMELINE_PHASES.map((phase) => toSeconds(phase.targetMinutes)),
    []
  );

  const [selectedProblemId, setSelectedProblemId] = useState<number>(problems[0]?.id ?? 1);
  const [remainingSeconds, setRemainingSeconds] = useState(PRACTICAL_TIMELINE_TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [actualSecondsByPhase, setActualSecondsByPhase] = useState<number[]>(
    () => Array.from({ length: PRACTICAL_TIMELINE_PHASES.length }, () => 0)
  );

  const selectedProblem =
    problems.find((problem) => problem.id === selectedProblemId) ?? problems[0];
  const isFinished = remainingSeconds <= 0;
  const isLastPhase = phaseIndex >= PRACTICAL_TIMELINE_PHASES.length - 1;
  const progressRate =
    (PRACTICAL_TIMELINE_TOTAL_SECONDS - remainingSeconds) / PRACTICAL_TIMELINE_TOTAL_SECONDS;
  const showFiveMinuteAlert = remainingSeconds > 0 && remainingSeconds <= 5 * 60;

  useEffect(() => {
    if (!isRunning || isFinished) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
      setActualSecondsByPhase((prev) => {
        const next = [...prev];
        next[phaseIndex] = (next[phaseIndex] ?? 0) + 1;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning, phaseIndex, isFinished]);

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(PRACTICAL_TIMELINE_TOTAL_SECONDS);
    setPhaseIndex(0);
    setActualSecondsByPhase(Array.from({ length: PRACTICAL_TIMELINE_PHASES.length }, () => 0));
  };

  const movePhase = (nextIndex: number) => {
    setPhaseIndex(Math.max(0, Math.min(PRACTICAL_TIMELINE_PHASES.length - 1, nextIndex)));
  };

  if (!selectedProblem) return null;

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-teal-800">40分タイムライン練習</h1>
              <p className="mt-1 text-sm text-slate-500">
                フェーズを手動で切り替えて、試験時間配分を再現します。
              </p>
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

      <main className="space-y-3 px-4 pt-3">
        <section className="panel p-4">
          <p className="text-sm font-semibold text-slate-700">対象問題</p>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {problems.map((problem) => {
              const active = problem.id === selectedProblemId;
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => setSelectedProblemId(problem.id)}
                  className={`rounded-lg border px-2 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  No.{problem.id}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">{selectedProblem.title}</p>
        </section>

        <section className="panel p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-slate-500">残り時間</p>
              <p className="font-display text-4xl font-bold text-teal-800">{formatClock(remainingSeconds)}</p>
            </div>
            <p className="text-sm font-semibold text-slate-500">進行 {Math.round(progressRate * 100)}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-teal-900/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-500 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progressRate * 100))}%` }}
            />
          </div>
          {showFiveMinuteAlert && (
            <p className="mt-2 text-sm font-semibold text-amber-700">残り5分です。最終見直しに入ってください。</p>
          )}
          {isFinished && (
            <p className="mt-2 text-sm font-semibold text-rose-700">40分経過。実績時間を確認してください。</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((prev) => !prev)}
              disabled={isFinished}
              className="rounded-lg border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {isRunning ? "一時停止" : "開始"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
            <button
              type="button"
              onClick={() => movePhase(phaseIndex + 1)}
              disabled={isLastPhase}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              次のフェーズ
            </button>
          </div>
        </section>

        <section className="panel p-4">
          <h2 className="text-base font-semibold text-slate-700">フェーズ進行</h2>
          <div className="mt-2 space-y-2">
            {PRACTICAL_TIMELINE_PHASES.map((phase, idx) => {
              const active = idx === phaseIndex;
              const done = idx < phaseIndex || (isFinished && idx === phaseIndex);
              const targetSeconds = phaseTargetSeconds[idx] ?? 0;
              const actualSeconds = actualSecondsByPhase[idx] ?? 0;
              return (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => movePhase(idx)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-teal-700 bg-teal-50/90"
                      : done
                        ? "border-emerald-300 bg-emerald-50/90"
                        : "border-slate-200 bg-white/90"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {idx + 1}. {phase.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      目安 {phase.targetMinutes}分 / 実績 {formatClock(actualSeconds)}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          targetSeconds > 0 ? (actualSeconds / targetSeconds) * 100 : 0
                        )}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
