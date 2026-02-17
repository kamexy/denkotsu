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
const amazonAssociateTag = (
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ??
  DEFAULT_AMAZON_ASSOCIATE_TAG
).trim();

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
