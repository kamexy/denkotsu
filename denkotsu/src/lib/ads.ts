const adsenseEnabled =
  (process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? "0").trim() === "1";

const adsenseClientId = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? ""
).trim();

const sessionCompleteAdSlot = (
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE ?? ""
).trim();

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
  return adsenseEnabled && adsenseClientId.length > 0;
}

export function getAdsenseClientId(): string {
  return adsenseClientId;
}

export function getSessionCompleteAdSlot(): string {
  return sessionCompleteAdSlot;
}

export function isAdPreviewMode(): boolean {
  return adsPreviewMode;
}

export function shouldShowSessionCompleteAd(totalAnswered: number): boolean {
  if (!adsenseEnabled) return false;
  if (adsPreviewMode) return totalAnswered >= 1;
  return totalAnswered >= minSessionAnswersForAd;
}

