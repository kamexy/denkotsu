"use client";

import { CATEGORY_LABELS, CATEGORY_COLORS, type Category } from "@/types";

interface CategoryBarProps {
  category: Category;
  value: number; // 0-100
}

export function CategoryBar({ category, value }: CategoryBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base text-slate-600 w-24 shrink-0 font-medium">
        {CATEGORY_LABELS[category]}
      </span>
      <div className="flex-1 h-2 bg-slate-200/70 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${CATEGORY_COLORS[category]}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="font-display text-base font-semibold text-slate-700 w-10 text-right">
        {value}%
      </span>
    </div>
  );
}
