const adsenseEnabled =
  (process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? "0").trim() === "1";

const adsenseClientId = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? ""
).trim();

const sessionCompleteAdSlot = (
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE ?? ""
).trim();
const learnAdSlot = (process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEARN ?? "").trim();
const statsAdSlot = (process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATS ?? "").trim();
const settingsAdSlot = (
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS ?? ""
).trim();

const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{16}$/;
const ADSENSE_SLOT_PATTERN = /^\d{6,20}$/;
const hasValidAdsenseClientId = ADSENSE_CLIENT_ID_PATTERN.test(adsenseClientId);
const hasValidSessionCompleteSlot = ADSENSE_SLOT_PATTERN.test(sessionCompleteAdSlot);
const hasValidLearnSlot = ADSENSE_SLOT_PATTERN.test(learnAdSlot);
const hasValidStatsSlot = ADSENSE_SLOT_PATTERN.test(statsAdSlot);
const hasValidSettingsSlot = ADSENSE_SLOT_PATTERN.test(settingsAdSlot);

const adsPreviewMode =
  (process.env.NEXT_PUBLIC_ADS_PREVIEW ?? "").trim() === "1" ||
  process.env.NODE_ENV !== "production";

const parsedMinSessionAnswers = Number.parseInt(
  (process.env.NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS ?? "10").trim(),
  10
);
const minSessionAnswersForAd =
  Number.isFinite(parsedMinSessionAnswers) && parsedMinSessionAnswers > 0
    ? parsedMinSessionAnswers
    : 10;

export function isAdsenseEnabled(): boolean {
  return adsenseEnabled;
}

export function isAdsenseScriptEnabled(): boolean {
  return adsenseEnabled && hasValidAdsenseClientId;
}

export function getAdsenseClientId(): string {
  return adsenseClientId;
}

export function getSessionCompleteAdSlot(): string {
  return hasValidSessionCompleteSlot ? sessionCompleteAdSlot : "";
}

function resolvePlacementAdSlot(
  slotValue: string,
  isValidPlacementSlot: boolean
): string {
  if (isValidPlacementSlot) return slotValue;
  if (hasValidSessionCompleteSlot) return sessionCompleteAdSlot;
  return "";
}

export function getLearnAdSlot(): string {
  return resolvePlacementAdSlot(learnAdSlot, hasValidLearnSlot);
}

export function getStatsAdSlot(): string {
  return resolvePlacementAdSlot(statsAdSlot, hasValidStatsSlot);
}

export function getSettingsAdSlot(): string {
  return resolvePlacementAdSlot(settingsAdSlot, hasValidSettingsSlot);
}

export function isAdPreviewMode(): boolean {
  return adsPreviewMode;
}

export function shouldShowSessionCompleteAd(totalAnswered: number): boolean {
  if (!adsenseEnabled) return false;
  if (adsPreviewMode) return totalAnswered >= 1;
  return totalAnswered >= minSessionAnswersForAd;
}

export function getAdsenseWarnings(): string[] {
  if (!adsenseEnabled) return [];

  const warnings: string[] = [];

  if (!hasValidAdsenseClientId) {
    warnings.push(
      "NEXT_PUBLIC_ADSENSE_CLIENT_ID が未設定または不正です（例: ca-pub-1234567890123456）。"
    );
  }

  if (!hasValidSessionCompleteSlot) {
    warnings.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE が未設定または不正です（数字のみ）。"
    );
  }

  if (learnAdSlot && !hasValidLearnSlot) {
    warnings.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_LEARN が不正です（数字のみ）。"
    );
  }

  if (statsAdSlot && !hasValidStatsSlot) {
    warnings.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_STATS が不正です（数字のみ）。"
    );
  }

  if (settingsAdSlot && !hasValidSettingsSlot) {
    warnings.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS が不正です（数字のみ）。"
    );
  }

  return warnings;
}
