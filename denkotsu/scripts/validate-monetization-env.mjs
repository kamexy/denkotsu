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
const telemetryEndpoint = (
  env.NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT ?? ""
).trim();
const gaMeasurementId = (env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
const parsedMinAnswers = Number.parseInt(
  (env.NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS ?? "10").trim(),
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
    "NEXT_PUBLIC_GA_MEASUREMENT_ID の形式が不正です（例: G-WD4GMKF6SR）。"
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

  if (!(Number.isFinite(parsedMinAnswers) && parsedMinAnswers > 0)) {
    errors.push(
      "NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS は 1 以上の整数で指定してください。"
    );
  }
} else if (
  adsenseClientId.length > 0 ||
  sessionCompleteAdSlot.length > 0 ||
  env.NEXT_PUBLIC_ADS_MIN_SESSION_ANSWERS
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
