"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/db";
import {
  COLLECTION_RARITY_LABELS,
  getCollectionItems,
  getCollectionTotalCount,
} from "@/lib/collection";
import {
  getAchievementDefinitions,
  getAchievementTotalCount,
  unlockAchievements,
} from "@/lib/achievements";
import type { AchievementUnlock, CollectionRarity, UserCollection } from "@/types";

const RARITY_ORDER: CollectionRarity[] = ["legendary", "rare", "normal"];
const RARITY_ACCENTS: Record<
  CollectionRarity,
  { badge: string; text: string; ring: string }
> = {
  legendary: {
    badge: "bg-amber-100 text-amber-800",
    text: "text-amber-700",
    ring: "border-amber-300",
  },
  rare: {
    badge: "bg-sky-100 text-sky-700",
    text: "text-sky-700",
    ring: "border-sky-300",
  },
  normal: {
    badge: "bg-teal-100 text-teal-700",
    text: "text-teal-700",
    ring: "border-teal-300",
  },
};

const ALL_COLLECTION_ITEMS = getCollectionItems();
const ALL_ACHIEVEMENTS = getAchievementDefinitions();

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CollectionPage() {
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [achievementUnlocks, setAchievementUnlocks] = useState<AchievementUnlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [rarityFilter, setRarityFilter] = useState<"all" | CollectionRarity>("all");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      await unlockAchievements();
      const [collectionRows, achievementRows] = await Promise.all([
        db.collections.toArray(),
        db.achievementUnlocks.toArray(),
      ]);

      if (cancelled) return;
      setCollections(collectionRows);
      setAchievementUnlocks(achievementRows);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const obtainedAtById = useMemo(
    () => new Map(collections.map((row) => [row.itemId, row.obtainedAt])),
    [collections]
  );

  const unlockedAtByAchievementId = useMemo(
    () =>
      new Map(
        achievementUnlocks.map((row) => [row.achievementId, row.unlockedAt])
      ),
    [achievementUnlocks]
  );

  const filteredItems = useMemo(() => {
    const baseItems =
      rarityFilter === "all"
        ? ALL_COLLECTION_ITEMS
        : ALL_COLLECTION_ITEMS.filter((item) => item.rarity === rarityFilter);

    return [...baseItems].sort((a, b) => {
      const aObtainedAt = obtainedAtById.get(a.id) ?? 0;
      const bObtainedAt = obtainedAtById.get(b.id) ?? 0;
      const aUnlocked = aObtainedAt > 0;
      const bUnlocked = bObtainedAt > 0;

      if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
      if (aUnlocked && bUnlocked && aObtainedAt !== bObtainedAt) {
        return bObtainedAt - aObtainedAt;
      }

      const rarityDiff =
        RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      if (rarityDiff !== 0) return rarityDiff;

      return a.name.localeCompare(b.name, "ja");
    });
  }, [obtainedAtById, rarityFilter]);

  const sortedAchievements = useMemo(() => {
    return [...ALL_ACHIEVEMENTS].sort((a, b) => {
      const aUnlockedAt = unlockedAtByAchievementId.get(a.id) ?? 0;
      const bUnlockedAt = unlockedAtByAchievementId.get(b.id) ?? 0;
      const aUnlocked = aUnlockedAt > 0;
      const bUnlocked = bUnlockedAt > 0;

      if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
      if (aUnlocked && bUnlockedAt !== aUnlockedAt) {
        return bUnlockedAt - aUnlockedAt;
      }

      return a.title.localeCompare(b.title, "ja");
    });
  }, [unlockedAtByAchievementId]);

  const rarityCounts = useMemo(() => {
    const countByRarity: Record<CollectionRarity, number> = {
      normal: 0,
      rare: 0,
      legendary: 0,
    };

    for (const row of collections) {
      const item = ALL_COLLECTION_ITEMS.find((candidate) => candidate.id === row.itemId);
      if (!item) continue;
      countByRarity[item.rarity] += 1;
    }

    return countByRarity;
  }, [collections]);

  return (
    <div className="pb-28">
      <header className="px-4 pt-3">
        <div className="panel px-4 py-3">
          <h1 className="font-display text-2xl font-bold text-teal-800">図鑑と実績</h1>
          <p className="text-sm text-slate-500 mt-1">
            問題を解いて集めるほど、学習の手応えが増えていきます。
          </p>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="panel p-4">
            <p className="text-sm text-slate-500 tracking-wide">図鑑収集率</p>
            <p className="mt-1 text-2xl font-display font-bold text-teal-800">
              {collections.length}/{getCollectionTotalCount()}
            </p>
          </div>
          <div className="panel p-4">
            <p className="text-sm text-slate-500 tracking-wide">実績解除数</p>
            <p className="mt-1 text-2xl font-display font-bold text-teal-800">
              {achievementUnlocks.length}/{getAchievementTotalCount()}
            </p>
          </div>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-base font-semibold text-slate-700">コレクション</h2>
            <p className="text-sm text-slate-500">正解時に30%でドロップ</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <FilterChip
              active={rarityFilter === "all"}
              onClick={() => setRarityFilter("all")}
            >
              すべて {collections.length}
            </FilterChip>
            {RARITY_ORDER.map((rarity) => (
              <FilterChip
                key={rarity}
                active={rarityFilter === rarity}
                onClick={() => setRarityFilter(rarity)}
              >
                {COLLECTION_RARITY_LABELS[rarity]} {rarityCounts[rarity]}
              </FilterChip>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filteredItems.map((item) => {
                const obtainedAt = obtainedAtById.get(item.id);
                const unlocked = typeof obtainedAt === "number";
                const accent = RARITY_ACCENTS[item.rarity];

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3 ${
                      unlocked
                        ? `bg-white/85 border-slate-200 ${accent.ring}`
                        : "bg-slate-100/70 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-lg leading-none">
                        {unlocked ? item.emoji : "❔"}
                      </p>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          unlocked ? accent.badge : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {unlocked ? COLLECTION_RARITY_LABELS[item.rarity] : "LOCK"}
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-sm font-semibold leading-tight ${
                        unlocked ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {unlocked ? item.name : "????"}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-relaxed ${
                        unlocked ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {unlocked ? item.description : "まだ見つかっていません"}
                    </p>
                    {unlocked && obtainedAt && (
                      <p className={`mt-1.5 text-[11px] font-medium ${accent.text}`}>
                        取得: {formatDateTime(obtainedAt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel p-4">
          <h2 className="text-base font-semibold text-slate-700 mb-3">実績</h2>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAchievements.map((achievement) => {
                const unlockedAt = unlockedAtByAchievementId.get(achievement.id);
                const unlocked = typeof unlockedAt === "number";

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-xl border px-3 py-3 ${
                      unlocked
                        ? "bg-[var(--primary-soft)]/60 border-teal-200"
                        : "bg-white/80 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-slate-800">
                          {achievement.icon} {achievement.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {achievement.description}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          unlocked
                            ? "bg-teal-100 text-teal-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {unlocked ? "達成" : "未達成"}
                      </span>
                    </div>
                    {unlocked && unlockedAt && (
                      <p className="text-[11px] text-teal-700 font-medium mt-1.5">
                        解除: {formatDateTime(unlockedAt)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${
        active
          ? "bg-teal-700 text-white border-teal-700"
          : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}
