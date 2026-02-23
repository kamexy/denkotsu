import { readFileSync } from "node:fs";
import path from "node:path";

const AMAZON_ASSOCIATE_TAG_PATTERN = /^[a-z0-9][a-z0-9-]{0,60}-22$/i;
const ADSENSE_CLIENT_ID_PATTERN = /^ca-pub-\d{16}$/;
const ADSENSE_SLOT_PATTERN = /^\d{6,20}$/;
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,20}$/;

const env = process.env;

const monetizationEnabled =
  (env.NEXT_PUBLIC_MONETIZATION_ENABLED ?? "1").trim() !== "0";
const configuredAmazonTag = (env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ?? "").trim();

const adsenseEnabled = (env.NEXT_PUBLIC_ADSENSE_ENABLED ?? "0").trim() === "1";
const adsenseClientId = (env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "").trim();
const sessionCompleteAdSlot = (
  env.NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE ?? ""
).trim();
const quizFeedbackAdSlot = (
  env.NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK ?? ""
).trim();
const learnAdSlot = (env.NEXT_PUBLIC_ADSENSE_SLOT_LEARN ?? "").trim();
const statsAdSlot = (env.NEXT_PUBLIC_ADSENSE_SLOT_STATS ?? "").trim();
const settingsAdSlot = (env.NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS ?? "").trim();
const telemetryEndpoint = (
  env.NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT ?? ""
).trim();
const gaMeasurementId = (env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
const parsedMinAnswers = Number.parseInt(
  (env.NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS ?? "10").trim(),
  10
);
const parsedMinFeedbackAnswers = Number.parseInt(
  (env.NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS ?? "3").trim(),
  10
);
const parsedFeedbackInterval = Number.parseInt(
  (env.NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL ?? "4").trim(),
  10
);

const errors = [];
const warnings = [];

if (
  monetizationEnabled &&
  configuredAmazonTag.length > 0 &&
  !AMAZON_ASSOCIATE_TAG_PATTERN.test(configuredAmazonTag)
) {
  errors.push(
    "NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG の形式が不正です（想定: xxxxx-22）。"
  );
}

if (telemetryEndpoint.length > 0) {
  try {
    const parsed = new URL(telemetryEndpoint);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      errors.push(
        "NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT は http(s) URL を指定してください。"
      );
    }
  } catch {
    errors.push(
      "NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT の形式が不正です。"
    );
  }
}

if (gaMeasurementId.length > 0 && !GA_MEASUREMENT_ID_PATTERN.test(gaMeasurementId)) {
  errors.push(
    "NEXT_PUBLIC_GA_MEASUREMENT_ID の形式が不正です（例: G-XXXXXXXXXX）。"
  );
}

if (adsenseEnabled) {
  if (!ADSENSE_CLIENT_ID_PATTERN.test(adsenseClientId)) {
    errors.push(
      "NEXT_PUBLIC_ADSENSE_CLIENT_ID が未設定または不正です（例: ca-pub-1234567890123456）。"
    );
  }

  if (!ADSENSE_SLOT_PATTERN.test(sessionCompleteAdSlot)) {
    errors.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_SESSION_COMPLETE が未設定または不正です（数字のみ）。"
    );
  }

  if (learnAdSlot.length > 0 && !ADSENSE_SLOT_PATTERN.test(learnAdSlot)) {
    errors.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_LEARN が不正です（数字のみ）。"
    );
  }

  if (quizFeedbackAdSlot.length > 0 && !ADSENSE_SLOT_PATTERN.test(quizFeedbackAdSlot)) {
    errors.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_QUIZ_FEEDBACK が不正です（数字のみ）。"
    );
  }

  if (statsAdSlot.length > 0 && !ADSENSE_SLOT_PATTERN.test(statsAdSlot)) {
    errors.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_STATS が不正です（数字のみ）。"
    );
  }

  if (settingsAdSlot.length > 0 && !ADSENSE_SLOT_PATTERN.test(settingsAdSlot)) {
    errors.push(
      "NEXT_PUBLIC_ADSENSE_SLOT_SETTINGS が不正です（数字のみ）。"
    );
  }

  if (!(Number.isFinite(parsedMinAnswers) && parsedMinAnswers > 0)) {
    errors.push(
      "NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS は 1 以上の整数で指定してください。"
    );
  }

  if (!(Number.isFinite(parsedMinFeedbackAnswers) && parsedMinFeedbackAnswers > 0)) {
    errors.push(
      "NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS は 1 以上の整数で指定してください。"
    );
  }

  if (!(Number.isFinite(parsedFeedbackInterval) && parsedFeedbackInterval > 0)) {
    errors.push(
      "NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL は 1 以上の整数で指定してください。"
    );
  }

  if (ADSENSE_CLIENT_ID_PATTERN.test(adsenseClientId)) {
    const expectedPublisherId = adsenseClientId.replace(/^ca-/, "");
    const expectedAdsTxtLine = `google.com, ${expectedPublisherId}, DIRECT, f08c47fec0942fa0`;
    const adsTxtPath = path.resolve(process.cwd(), "public/ads.txt");

    try {
      const adsTxt = readFileSync(adsTxtPath, "utf8");
      const normalizedLines = adsTxt
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"))
        .map((line) => line.replace(/\s+/g, ""));
      const normalizedExpected = expectedAdsTxtLine.replace(/\s+/g, "");

      if (!normalizedLines.includes(normalizedExpected)) {
        errors.push(
          `public/ads.txt に AdSense パブリッシャー行が見つかりません（期待値: ${expectedAdsTxtLine}）。`
        );
      }
    } catch {
      errors.push("public/ads.txt を読み取れませんでした。");
    }
  }
} else if (
  adsenseClientId.length > 0 ||
  sessionCompleteAdSlot.length > 0 ||
  quizFeedbackAdSlot.length > 0 ||
  env.NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS ||
  env.NEXT_PUBLIC_ADS_MIN_FEEDBACK_ANSWERS ||
  env.NEXT_PUBLIC_ADS_FEEDBACK_INTERVAL
) {
  warnings.push(
    "AdSense 関連の値は設定されていますが、NEXT_PUBLIC_ADSENSE_ENABLED=1 ではないため広告表示は無効です。"
  );
}

if (warnings.length > 0) {
  for (const warning of warnings) {
    console.warn(`[validate-monetization] WARN: ${warning}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`[validate-monetization] ERROR: ${error}`);
  }
  process.exit(1);
}

console.log("[validate-monetization] OK");
