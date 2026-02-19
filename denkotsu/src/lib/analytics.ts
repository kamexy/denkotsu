const gaMeasurementIdRaw = (
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""
).trim();

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{6,20}$/;
const hasValidGaMeasurementId =
  gaMeasurementIdRaw.length > 0 && GA_MEASUREMENT_ID_PATTERN.test(gaMeasurementIdRaw);

export function isGaEnabled(): boolean {
  return hasValidGaMeasurementId;
}

export function getGaMeasurementId(): string {
  return hasValidGaMeasurementId ? gaMeasurementIdRaw : "";
}

export function getGaWarnings(): string[] {
  if (!gaMeasurementIdRaw) return [];
  if (hasValidGaMeasurementId) return [];

  return [
    "NEXT_PUBLIC_GA_MEASUREMENT_ID が不正です（例: G-XXXXXXXXXX）。",
  ];
}
