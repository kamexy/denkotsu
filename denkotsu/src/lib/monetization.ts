import recommendedToolsData from "@/data/recommended-tools.json";

export interface RecommendedTool {
  id: string;
  name: string;
  description: string;
  url: string;
  label: string;
}

const monetizationEnabled =
  (process.env.NEXT_PUBLIC_MONETIZATION_ENABLED ?? "1").trim() !== "0";

const DEFAULT_AMAZON_ASSOCIATE_TAG = "kamexy-22";
const AMAZON_ASSOCIATE_TAG_PATTERN = /^[a-z0-9][a-z0-9-]{0,60}-22$/i;
const configuredAmazonAssociateTag = (
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ??
  ""
).trim();
const hasValidConfiguredTag =
  configuredAmazonAssociateTag.length > 0 &&
  AMAZON_ASSOCIATE_TAG_PATTERN.test(configuredAmazonAssociateTag);
const amazonAssociateTag = hasValidConfiguredTag
  ? configuredAmazonAssociateTag
  : DEFAULT_AMAZON_ASSOCIATE_TAG;

function appendAmazonAssociateTag(url: string): string {
  if (!amazonAssociateTag) return url;

  try {
    const parsed = new URL(url);
    const isAmazon = parsed.hostname === "amazon.co.jp" || parsed.hostname.endsWith(".amazon.co.jp");
    if (!isAmazon) return url;

    parsed.searchParams.set("tag", amazonAssociateTag);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getRecommendedTools(): RecommendedTool[] {
  if (!monetizationEnabled) return [];

  return recommendedToolsData.map((tool) => ({
    ...tool,
    url: appendAmazonAssociateTag(tool.url),
  }));
}

export function getMonetizationWarnings(): string[] {
  if (!monetizationEnabled) return [];
  if (configuredAmazonAssociateTag.length === 0 || hasValidConfiguredTag) return [];

  return [
    `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG が不正なため既定値 ${DEFAULT_AMAZON_ASSOCIATE_TAG} を使用します（想定形式: xxxxx-22）。`,
  ];
}
