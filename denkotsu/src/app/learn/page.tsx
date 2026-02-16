"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Category } from "@/types";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/types";
import { getAllKeyPoints, getKeyPointsByCategory } from "@/lib/key-points";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

export default function LearnPage() {
  return (
    <Suspense>
      <LearnPageContent />
    </Suspense>
  );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
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
    }
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const keyPoints = useMemo(
    () =>
      selectedCategory === "all"
        ? getAllKeyPoints()
        : getKeyPointsByCategory(selectedCategory as Category),
    [selectedCategory]
  );

  const categoryCounts = useMemo(() => {
    const all = getAllKeyPoints();
    const counts: Record<string, number> = { all: all.length };
    for (const c of ALL_CATEGORIES) {
      counts[c] = all.filter((kp) => kp.category === c).length;
    }
    return counts;
  }, []);

  return (
    <div className="pb-20">
      <header className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">要点チェック</h1>
        <p className="text-xs text-gray-400 mt-1">
          試験に出る重要ポイントをサクッと確認
        </p>
      </header>

      {/* Category filter tabs */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 py-3 min-w-max">
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

      {/* Key point cards */}
      <div className="px-4 space-y-3 mt-1">
        <AnimatePresence mode="popLayout">
          {keyPoints.map((kp) => (
            <motion.div
              key={kp.id}
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
      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {label}
      <span className={`ml-1 ${active ? "text-blue-200" : "text-gray-400"}`}>
        {count}
      </span>
    </button>
  );
}

const CATEGORY_ACCENT: Record<Category, { bg: string; text: string; tag: string }> = {
  electrical_theory: { bg: "bg-blue-50", text: "text-blue-700", tag: "bg-blue-100 text-blue-600" },
  wiring_diagram: { bg: "bg-purple-50", text: "text-purple-700", tag: "bg-purple-100 text-purple-600" },
  laws: { bg: "bg-amber-50", text: "text-amber-700", tag: "bg-amber-100 text-amber-600" },
  construction_method: { bg: "bg-emerald-50", text: "text-emerald-700", tag: "bg-emerald-100 text-emerald-600" },
  equipment_material: { bg: "bg-rose-50", text: "text-rose-700", tag: "bg-rose-100 text-rose-600" },
  inspection: { bg: "bg-cyan-50", text: "text-cyan-700", tag: "bg-cyan-100 text-cyan-600" },
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
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left rounded-xl border transition-all ${
        expanded
          ? `${accent.bg} border-transparent shadow-sm`
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-1.5 ${accent.tag}`}
            >
              {CATEGORY_LABELS[category]}
            </span>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          </div>
          <span
            className={`text-gray-400 text-xs transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </div>

        {/* Formula (always visible if present) */}
        {formula && (
          <div
            className={`mt-2 px-3 py-2 rounded-lg font-mono text-sm font-bold text-center ${
              expanded ? "bg-white/70" : "bg-gray-50"
            } ${accent.text}`}
          >
            {formula}
          </div>
        )}

        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {image && (
                <div className="mt-3 rounded-lg overflow-hidden bg-white/70">
                  <ImageLightbox
                    src={image}
                    alt={title}
                    className="w-full max-h-[180px] object-contain p-2"
                  />
                </div>
              )}
              <p className="text-sm text-gray-700 leading-relaxed mt-3">
                {body}
              </p>
              {example && (
                <div className="mt-2 px-3 py-2 bg-white/60 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">
                    例
                  </p>
                  <p className="text-sm text-gray-700">{example}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
