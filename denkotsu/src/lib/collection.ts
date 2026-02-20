import collectionItemsData from "@/data/collection-items.json";
import { db } from "@/lib/db";
import type { CollectionItem, CollectionRarity } from "@/types";

const COLLECTION_ITEMS: CollectionItem[] = collectionItemsData as CollectionItem[];

export const COLLECTION_DROP_RATE = 0.3;

const RARITY_WEIGHTS: Record<CollectionRarity, number> = {
  normal: 0.7,
  rare: 0.25,
  legendary: 0.05,
};

export const COLLECTION_RARITY_LABELS: Record<CollectionRarity, string> = {
  normal: "ノーマル",
  rare: "レア",
  legendary: "レジェンド",
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickRarity(): CollectionRarity {
  const roll = Math.random();
  let cumulative = 0;

  const entries = Object.entries(RARITY_WEIGHTS) as Array<
    [CollectionRarity, number]
  >;
  for (const [rarity, weight] of entries) {
    cumulative += weight;
    if (roll <= cumulative) {
      return rarity;
    }
  }

  return "normal";
}

export function getCollectionItems(): CollectionItem[] {
  return COLLECTION_ITEMS;
}

export function getCollectionItemById(id: string): CollectionItem | undefined {
  return COLLECTION_ITEMS.find((item) => item.id === id);
}

export function getCollectionTotalCount(): number {
  return COLLECTION_ITEMS.length;
}

export async function tryDropCollectionItem(
  isCorrect: boolean
): Promise<CollectionItem | null> {
  if (!isCorrect) return null;
  if (Math.random() > COLLECTION_DROP_RATE) return null;

  const obtainedIds = new Set((await db.collections.toArray()).map((c) => c.itemId));
  const remainingItems = COLLECTION_ITEMS.filter((item) => !obtainedIds.has(item.id));

  if (remainingItems.length === 0) {
    return null;
  }

  const rarity = pickRarity();
  const rarityPool = remainingItems.filter((item) => item.rarity === rarity);
  const targetPool = rarityPool.length > 0 ? rarityPool : remainingItems;
  const dropped = pickRandom(targetPool);

  await db.collections.put({
    itemId: dropped.id,
    obtainedAt: Date.now(),
  });

  return dropped;
}
