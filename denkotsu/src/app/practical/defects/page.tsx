"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getPracticalDefectQuestions } from "@/lib/practical";

export default function PracticalDefectsPage() {
  const questions = useMemo(() => getPracticalDefectQuestions(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const current = questions[index];
  if (!current) return null;

  const answered = selected !== null;
  const isCorrect = answered ? selected === current.hasDefect : null;

  const handleAnswer = (value: boolean) => {
    if (answered) return;
    setSelected(value);
    setAnsweredCount((prev) => prev + 1);
    if (value === current.hasDefect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setIndex((prev) => (prev + 1) % questions.length);
  };

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-teal-800">欠陥判定クイズ</h1>
              <p className="text-sm text-slate-500 mt-1">合格/欠陥ありを2択で判断します。</p>
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
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-slate-700">Q.{index + 1}/{questions.length}</p>
            <p className="text-slate-500">正答率 {accuracy}%</p>
          </div>

          <h2 className="mt-2 text-base font-semibold text-slate-800">{current.title}</h2>

          {current.image && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="mx-auto w-full max-w-[520px]">
                <div className="diagram-surface relative overflow-hidden rounded-lg border">
                  <Image
                    src={current.image}
                    alt={current.title}
                    width={960}
                    height={540}
                    unoptimized
                    className="diagram-image h-auto w-full"
                  />
                  {answered && current.hasDefect && current.defectMarkerPosition && (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-slate-900/20" />
                      <div
                        className="pointer-events-none absolute rounded-md border-2 border-rose-500 bg-rose-500/20 shadow-[0_0_0_9999px_rgba(15,23,42,0.24)]"
                        style={{
                          left: `${current.defectMarkerPosition.x}%`,
                          top: `${current.defectMarkerPosition.y}%`,
                          width: `${current.defectMarkerPosition.width}%`,
                          height: `${current.defectMarkerPosition.height}%`,
                        }}
                      />
                      <div
                        className="pointer-events-none absolute rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white"
                        style={{
                          left: `${Math.max(current.defectMarkerPosition.x - 1, 0)}%`,
                          top: `${Math.max(current.defectMarkerPosition.y - 6, 0)}%`,
                        }}
                      >
                        {current.defectMarkerLabel ?? "欠陥箇所"}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-sm text-slate-600">この施工は欠陥がありますか？</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <AnswerButton
              active={selected === false}
              disabled={answered}
              onClick={() => handleAnswer(false)}
              label="合格"
            />
            <AnswerButton
              active={selected === true}
              disabled={answered}
              onClick={() => handleAnswer(true)}
              label="欠陥あり"
            />
          </div>

          {answered && (
            <div
              className={`mt-3 rounded-xl border p-3 ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50/70"
                  : "border-rose-300 bg-rose-50/70"
              }`}
            >
              <p className={`text-sm font-semibold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                {isCorrect ? "正解です" : "不正解です"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                判定: {current.hasDefect ? "欠陥あり" : "合格"}
              </p>
              {current.defectType && (
                <p className="mt-1 text-sm text-slate-600">欠陥種別: {current.defectType}</p>
              )}
              {current.defectDescription && (
                <p className="mt-1 text-sm text-slate-600">{current.defectDescription}</p>
              )}
              {current.hasDefect && (
                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2">
                  <p className="text-xs font-semibold text-rose-700">
                    どこが欠陥か: {current.defectMarkerLabel ?? "画像のマーキング箇所"}
                  </p>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">判定基準: {current.judgingCriteria}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="mt-3 rounded-lg border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
          >
            次の問題へ
          </button>
        </section>
      </main>
    </div>
  );
}

function AnswerButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      } disabled:opacity-60`}
    >
      {label}
    </button>
  );
}
