const adsenseEnabled =
  (process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? "0").trim() === "1";

const adsenseClientId = (
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? ""
).trim();

const sessionCompleteAdSlot = (
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE ?? ""
).trim();
const quizFeedbackAdSlot = (
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK ?? ""
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
const hasValidQuizFeedbackSlot = ADSENSE_SLOT_PATTERN.test(quizFeedbackAdSlot);
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
const parsedMinFeedbackAnswers = Number.parseInt(
  (process.env.NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS ?? "3").trim(),
  10
);
const minFeedbackAnswersForAd =
  Number.isFinite(parsedMinFeedbackAnswers) && parsedMinFeedbackAnswers > 0
    ? parsedMinFeedbackAnswers
    : 3;
const parsedFeedbackInterval = Number.parseInt(
  (process.env.NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL ?? "4").trim(),
  10
);
const feedbackInterval =
  Number.isFinite(parsedFeedbackInterval) && parsedFeedbackInterval > 0
    ? parsedFeedbackInterval
    : 4;

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

export function getQuizFeedbackAdSlot(): string {
  return resolvePlacementAdSlot(quizFeedbackAdSlot, hasValidQuizFeedbackSlot);
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

export function shouldShowQuizFeedbackAd(totalAnswered: number): boolean {
  if (!adsenseEnabled) return false;
  if (adsPreviewMode) {
    return totalAnswered >= 1 && totalAnswered % 2 === 0;
  }
  if (totalAnswered < minFeedbackAnswersForAd) return false;
  return totalAnswered % feedbackInterval === 0;
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

  if (quizFeedbackAdSlot && !hasValidQuizFeedbackSlot) {
    warnings.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK が不正です（数字のみ）。"
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
