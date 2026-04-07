"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/types";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/types";
import { getAllKeyPoints } from "@/lib/key-points";
import { usePassPower } from "@/hooks/usePassPower";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { AdSlot } from "@/components/ads/AdSlot";
import { getLearnAdSlot, isAdsenseEnabled } from "@/lib/ads";
import {
  recommendKeyPoints,
  type KeyPointRecommendation,
} from "@/lib/key-point-recommendations";

export default function LearnPage() {
  return (
    <Suspense fallback={<LearnFallback />}>
      <LearnPageContent />
    </Suspense>
  );
}

function LearnFallback() {
  return (
    <div className="pb-28 px-4 pt-3">
      <div className="panel px-4 py-3">
        <div className="h-8 w-36 rounded bg-slate-200 animate-pulse" />
        <div className="mt-2 h-4 w-56 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-8 rounded-full bg-slate-200 animate-pulse"
          />
        ))}
      </div>
      <div className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="panel h-28 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const { passPower } = usePassPower();
  const initialCategory = searchParams.get("category") as Category | null;
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">(
    initialCategory && ALL_CATEGORIES.includes(initialCategory)
      ? initialCategory
      : "all"
  );

  // URLクエリ変更時にカテゴリを同期（React推奨のレンダー時比較パターン）
  const categoryParam = searchParams.get("category") as Category | null;
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    if (categoryParam && ALL_CATEGORIES.includes(categoryParam)) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("all");
    }
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pendingScrollTargetRef = useRef<string | null>(null);
  const scrollRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showLearnAd = isAdsenseEnabled();
  const learnAdSlot = getLearnAdSlot();
  const allKeyPoints = useMemo(() => getAllKeyPoints(), []);

  const keyPoints = useMemo(
    () =>
      selectedCategory === "all"
        ? allKeyPoints
        : allKeyPoints.filter((keyPoint) => keyPoint.category === selectedCategory),
    [allKeyPoints, selectedCategory]
  );

  const recommendedKeyPoints = useMemo(
    () =>
      recommendKeyPoints({
        keyPoints: allKeyPoints,
        passPower,
        selectedCategory,
        limit: selectedCategory === "all" ? 6 : 4,
      }),
    [allKeyPoints, passPower, selectedCategory]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allKeyPoints.length };
    for (const c of ALL_CATEGORIES) {
      counts[c] = allKeyPoints.filter((kp) => kp.category === c).length;
    }
    return counts;
  }, [allKeyPoints]);

  const jumpToKeyPoint = useCallback((keyPointId: string) => {
    pendingScrollTargetRef.current = keyPointId;
    setExpandedId(keyPointId);
  }, []);

  useEffect(() => {
    if (expandedId === null) return;
    if (pendingScrollTargetRef.current !== expandedId) return;
    if (typeof window === "undefined") return;

    const scrollToTarget = (behavior: ScrollBehavior) => {
      const element = document.getElementById(`keypoint-${expandedId}`);
      if (!element) return;
      element.scrollIntoView({ behavior, block: "start" });
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToTarget("smooth");
      });
    });

    if (scrollRetryTimerRef.current !== null) {
      clearTimeout(scrollRetryTimerRef.current);
    }

    scrollRetryTimerRef.current = setTimeout(() => {
      scrollToTarget("smooth");
      pendingScrollTargetRef.current = null;
      scrollRetryTimerRef.current = null;
    }, 260);

    return () => {
      if (scrollRetryTimerRef.current !== null) {
        clearTimeout(scrollRetryTimerRef.current);
        scrollRetryTimerRef.current = null;
      }
    };
  }, [expandedId]);

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <h1 className="font-display text-2xl font-bold text-teal-800">要点チェック</h1>
          <p className="text-sm text-slate-500 mt-1">
          試験に出る重要ポイントをサクッと確認
          </p>
        </div>
      </header>

      {/* Category filter tabs */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <CategoryTab
            label="すべて"
            count={categoryCounts["all"]}
            active={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
          />
          {ALL_CATEGORIES.map((cat) => (
            <CategoryTab
              key={cat}
              label={CATEGORY_LABELS[cat]}
              count={categoryCounts[cat]}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>

      {recommendedKeyPoints.length > 0 && (
        <div className="px-4 pt-3">
          <RecommendedKeyPointsPanel
            recommendations={recommendedKeyPoints}
            onSelect={jumpToKeyPoint}
          />
        </div>
      )}

      {showLearnAd && (
        <div className="px-4 pt-3">
          <AdSlot
            slot={learnAdSlot}
            placement="learn_page"
            className="w-full"
          />
        </div>
      )}

      {/* Key point cards */}
      <div className="px-4 space-y-3 mt-1">
        <AnimatePresence mode="popLayout">
          {keyPoints.map((kp) => (
            <motion.div
              key={kp.id}
              id={`keypoint-${kp.id}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <KeyPointCard
                category={kp.category}
                title={kp.title}
                formula={kp.formula}
                body={kp.body}
                example={kp.example}
                image={kp.image}
                expanded={expandedId === kp.id}
                onToggle={() =>
                  setExpandedId(expandedId === kp.id ? null : kp.id)
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RecommendedKeyPointsPanel({
  recommendations,
  onSelect,
}: {
  recommendations: KeyPointRecommendation[];
  onSelect: (keyPointId: string) => void;
}) {
  return (
    <section className="panel p-4">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-base font-semibold tracking-wide text-slate-700">
          今見るべき要点
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          合格力が低い分野や、まだ触れていない分野から優先して見るべき要点です。タップすると該当の要点へ移動します。
        </p>
      </div>
      <div className="mt-3 space-y-2">
        {recommendations.map((item) => (
          <button
            key={item.keyPoint.id}
            type="button"
            onClick={() => onSelect(item.keyPoint.id)}
            className="group block w-full cursor-pointer rounded-2xl border border-slate-200/90 bg-white px-3 py-3 text-left transition-all hover:border-teal-200 hover:bg-teal-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <span className="inline-flex whitespace-nowrap rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {CATEGORY_LABELS[item.keyPoint.category]}
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {item.keyPoint.title}
                </p>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                  {item.reason}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-teal-700">
                  下の要点へ移動
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition-all group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-700">
                <ArrowDownIcon className="h-4 w-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 5.5L12 10L7.5 14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10 4.75V14.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 10.75L10 14.25L13.5 10.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-3 py-1.5 rounded-full text-sm font-semibold transition-colors border text-center ${
        active
          ? "bg-teal-700 text-white border-teal-700"
          : "bg-white/75 border-slate-200 text-slate-600 hover:bg-white"
      }`}
    >
      {label}
      <span className={`ml-1 ${active ? "text-teal-200" : "text-slate-400"}`}>
        {count}
      </span>
    </button>
  );
}

const CATEGORY_ACCENT: Record<Category, { bg: string; text: string; tag: string }> = {
  electrical_theory: { bg: "bg-teal-50/90", text: "text-teal-800", tag: "bg-teal-100 text-teal-700" },
  wiring_diagram: { bg: "bg-sky-50/90", text: "text-sky-800", tag: "bg-sky-100 text-sky-700" },
  laws: { bg: "bg-amber-50/90", text: "text-amber-800", tag: "bg-amber-100 text-amber-700" },
  construction_method: { bg: "bg-emerald-50/90", text: "text-emerald-800", tag: "bg-emerald-100 text-emerald-700" },
  equipment_material: { bg: "bg-orange-50/90", text: "text-orange-800", tag: "bg-orange-100 text-orange-700" },
  inspection: { bg: "bg-cyan-50/90", text: "text-cyan-800", tag: "bg-cyan-100 text-cyan-700" },
};

function KeyPointCard({
  category,
  title,
  formula,
  body,
  example,
  image,
  expanded,
  onToggle,
}: {
  category: Category;
  title: string;
  formula: string | null;
  body: string;
  example: string | null;
  image?: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const accent = CATEGORY_ACCENT[category];

  return (
    <div
      className={`w-full text-left rounded-2xl border transition-all ${
        expanded
          ? `${accent.bg} border-white/60 shadow-sm`
          : "bg-white/82 border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left"
        aria-expanded={expanded}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold mb-1.5 ${accent.tag}`}
            >
              {CATEGORY_LABELS[category]}
            </span>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
          </div>
          <span
            className={`text-slate-400 text-sm transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>

        {/* Formula (always visible if present) */}
        {formula && (
          <div
            className={`mt-2 px-3 py-2 rounded-lg font-mono text-base font-bold text-center ${
              expanded ? "bg-white/80" : "bg-slate-50"
            } ${accent.text}`}
          >
            {formula}
          </div>
        )}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-4 pb-4"
          >
            {image && (
              <div className="diagram-surface mt-1 rounded-lg overflow-hidden border">
                <ImageLightbox
                  src={image}
                  alt={title}
                  className="w-full max-h-[180px] object-contain p-2"
                />
              </div>
            )}
            <p className="text-base text-slate-700 leading-relaxed mt-3">
              {body}
            </p>
            {example && (
              <div className="mt-2 px-3 py-2 bg-white/70 rounded-lg border border-white/70">
                <p className="text-sm text-slate-500 font-semibold mb-0.5">
                  例
                </p>
                <p className="text-base text-slate-700">{example}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
