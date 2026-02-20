import { db } from "@/lib/db";
import { calculatePassPower } from "@/lib/pass-power";
import { getCollectionItemById } from "@/lib/collection";
import { getAllQuestions } from "@/lib/questions";
import {
  ALL_CATEGORIES,
  type AchievementDefinition,
  type Category,
  type PassPower,
} from "@/types";

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first_answer",
    title: "はじめの一歩",
    description: "初めて問題に回答した。",
    icon: "🔰",
  },
  {
    id: "answered_10",
    title: "10問達成",
    description: "累計10問に回答した。",
    icon: "🧩",
  },
  {
    id: "answered_50",
    title: "50問達成",
    description: "累計50問に回答した。",
    icon: "📚",
  },
  {
    id: "answered_100",
    title: "100問達成",
    description: "累計100問に回答した。",
    icon: "🏁",
  },
  {
    id: "streak_5",
    title: "5連続正解",
    description: "連続5問正解を達成した。",
    icon: "🔥",
  },
  {
    id: "streak_10",
    title: "10連続正解",
    description: "連続10問正解を達成した。",
    icon: "⚡",
  },
  {
    id: "power_30",
    title: "成長スタート",
    description: "合格力30%に到達した。",
    icon: "🌱",
  },
  {
    id: "power_60",
    title: "合格射程",
    description: "合格力60%に到達した。",
    icon: "🎯",
  },
  {
    id: "power_80",
    title: "合格圏",
    description: "合格力80%に到達した。",
    icon: "🏆",
  },
  {
    id: "all_categories_70",
    title: "全分野制覇",
    description: "全分野の合格力70%以上を達成した。",
    icon: "🗺️",
  },
  {
    id: "all_categories_played",
    title: "全分野チャレンジャー",
    description: "6分野すべての問題に回答した。",
    icon: "🧠",
  },
  {
    id: "collection_1",
    title: "図鑑デビュー",
    description: "図鑑アイテムを初めて獲得した。",
    icon: "🎁",
  },
  {
    id: "collection_10",
    title: "収集ビギナー",
    description: "図鑑アイテムを10種集めた。",
    icon: "🧰",
  },
  {
    id: "collection_25",
    title: "収集マスター",
    description: "図鑑アイテムを25種集めた。",
    icon: "🪙",
  },
  {
    id: "collection_legendary",
    title: "伝説ハンター",
    description: "レジェンドアイテムを獲得した。",
    icon: "💎",
  },
];

interface AchievementMetrics {
  totalAnswered: number;
  currentCorrectStreak: number;
  passPower: PassPower;
  answeredCategories: Set<Category>;
  collectionCount: number;
  hasLegendaryCollection: boolean;
}

function getCurrentCorrectStreak(
  answers: Array<{ isCorrect: boolean; answeredAt: number }>
): number {
  const sorted = [...answers].sort((a, b) => b.answeredAt - a.answeredAt);
  let streak = 0;

  for (const answer of sorted) {
    if (!answer.isCorrect) break;
    streak += 1;
  }

  return streak;
}

function getAnsweredCategories(
  questionIds: string[]
): Set<Category> {
  const questionById = new Map(
    getAllQuestions().map((question) => [question.id, question])
  );
  const categories = new Set<Category>();

  for (const questionId of questionIds) {
    const question = questionById.get(questionId);
    if (!question) continue;
    categories.add(question.category);
  }

  return categories;
}

function hasAllCategoriesOver(passPower: PassPower, threshold: number): boolean {
  return ALL_CATEGORIES.every((category) => passPower.byCategory[category] >= threshold);
}

function isAchievementUnlocked(
  achievementId: string,
  metrics: AchievementMetrics
): boolean {
  switch (achievementId) {
    case "first_answer":
      return metrics.totalAnswered >= 1;
    case "answered_10":
      return metrics.totalAnswered >= 10;
    case "answered_50":
      return metrics.totalAnswered >= 50;
    case "answered_100":
      return metrics.totalAnswered >= 100;
    case "streak_5":
      return metrics.currentCorrectStreak >= 5;
    case "streak_10":
      return metrics.currentCorrectStreak >= 10;
    case "power_30":
      return metrics.passPower.overall >= 30;
    case "power_60":
      return metrics.passPower.overall >= 60;
    case "power_80":
      return metrics.passPower.overall >= 80;
    case "all_categories_70":
      return hasAllCategoriesOver(metrics.passPower, 70);
    case "all_categories_played":
      return metrics.answeredCategories.size === ALL_CATEGORIES.length;
    case "collection_1":
      return metrics.collectionCount >= 1;
    case "collection_10":
      return metrics.collectionCount >= 10;
    case "collection_25":
      return metrics.collectionCount >= 25;
    case "collection_legendary":
      return metrics.hasLegendaryCollection;
    default:
      return false;
  }
}

async function buildMetrics(passPowerInput?: PassPower): Promise<AchievementMetrics> {
  const [answers, collections, passPower] = await Promise.all([
    db.answers.toArray(),
    db.collections.toArray(),
    passPowerInput ? Promise.resolve(passPowerInput) : calculatePassPower(),
  ]);

  const answeredCategories = getAnsweredCategories(
    answers.map((answer) => answer.questionId)
  );
  const currentCorrectStreak = getCurrentCorrectStreak(answers);
  const hasLegendaryCollection = collections.some((collection) => {
    const item = getCollectionItemById(collection.itemId);
    return item?.rarity === "legendary";
  });

  return {
    totalAnswered: answers.length,
    currentCorrectStreak,
    passPower,
    answeredCategories,
    collectionCount: collections.length,
    hasLegendaryCollection,
  };
}

export function getAchievementDefinitions(): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS;
}

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((achievement) => achievement.id === id);
}

export function getAchievementTotalCount(): number {
  return ACHIEVEMENT_DEFINITIONS.length;
}

export async function unlockAchievements(
  passPowerInput?: PassPower
): Promise<AchievementDefinition[]> {
  const [metrics, unlockedRows] = await Promise.all([
    buildMetrics(passPowerInput),
    db.achievementUnlocks.toArray(),
  ]);
  const alreadyUnlocked = new Set(
    unlockedRows.map((achievement) => achievement.achievementId)
  );

  const newlyUnlocked = ACHIEVEMENT_DEFINITIONS.filter((achievement) => {
    if (alreadyUnlocked.has(achievement.id)) return false;
    return isAchievementUnlocked(achievement.id, metrics);
  });

  if (newlyUnlocked.length > 0) {
    const unlockedAt = Date.now();
    await db.achievementUnlocks.bulkPut(
      newlyUnlocked.map((achievement) => ({
        achievementId: achievement.id,
        unlockedAt,
      }))
    );
  }

  return newlyUnlocked;
}
