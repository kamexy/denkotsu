export type MonetizationEventName =
  | "sponsored_tool_click"
  | "ad_slot_rendered"
  | "ad_slot_interaction";

interface MonetizationEventPayload {
  placement:
    | "settings_recommended_tools"
    | "session_complete"
    | "learn_page"
    | "stats_page"
    | "settings_page";
  mode?: "adsense" | "preview";
  toolId?: string;
  toolName?: string;
  slot?: string;
  destination?: string;
}

interface MonetizationEventRecord {
  eventName: MonetizationEventName;
  payload: MonetizationEventPayload;
  at: string;
  appVersion: string;
}

const telemetryEnabled =
  (process.env.NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENABLED ?? "1").trim() !== "0";
const telemetryEndpointRaw = (
  process.env.NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT ?? ""
).trim();
const telemetryDebugMode =
  (process.env.NEXT_PUBLIC_MONETIZATION_TELEMETRY_DEBUG ?? "").trim() === "1";
const appVersion = (process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown").trim();

function normalizeTelemetryEndpoint(raw: string): string {
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return "";
  }
  return "";
}

const telemetryEndpoint = normalizeTelemetryEndpoint(telemetryEndpointRaw);

function toEventRecord(
  eventName: MonetizationEventName,
  payload: MonetizationEventPayload
): MonetizationEventRecord {
  return {
    eventName,
    payload,
    at: new Date().toISOString(),
    appVersion,
  };
}

function sanitizeDestination(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function sendToEndpoint(record: MonetizationEventRecord): void {
  if (!telemetryEndpoint || typeof window === "undefined") return;

  const body = JSON.stringify(record);

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(telemetryEndpoint, blob);
      return;
    }
  } catch {
    // sendBeacon 失敗時は fetch にフォールバック
  }

  void fetch(telemetryEndpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // 通信失敗時でもUI操作は継続
  });
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    sa_event?: (eventName: string, payload?: Record<string, unknown>) => void;
  }
}

function sendToKnownAnalytics(record: MonetizationEventRecord): void {
  if (typeof window === "undefined") return;
  const { eventName, payload } = record;
  const analyticsProps: Record<string, unknown> = { ...payload };

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }
  } catch {
    // no-op
  }

  try {
    if (typeof window.plausible === "function") {
      window.plausible(eventName, { props: analyticsProps });
    }
  } catch {
    // no-op
  }

  try {
    if (typeof window.sa_event === "function") {
      window.sa_event(eventName, analyticsProps);
    }
  } catch {
    // no-op
  }
}

function trackMonetizationEvent(
  eventName: MonetizationEventName,
  payload: MonetizationEventPayload
): void {
  if (!telemetryEnabled || typeof window === "undefined") return;

  const record = toEventRecord(eventName, payload);
  sendToKnownAnalytics(record);
  sendToEndpoint(record);

  if (telemetryDebugMode || process.env.NODE_ENV !== "production") {
    console.info("[telemetry]", record);
  }
}

export function trackSponsoredToolClick(input: {
  toolId: string;
  toolName: string;
  destination: string;
}): void {
  trackMonetizationEvent("sponsored_tool_click", {
    placement: "settings_recommended_tools",
    toolId: input.toolId,
    toolName: input.toolName,
    destination: sanitizeDestination(input.destination),
  });
}

export function trackAdSlotRendered(input: {
  slot: string;
  mode: "adsense" | "preview";
  placement: "session_complete" | "learn_page" | "stats_page" | "settings_page";
}): void {
  trackMonetizationEvent("ad_slot_rendered", {
    placement: input.placement,
    slot: input.slot,
    mode: input.mode,
  });
}

export function trackAdSlotInteraction(input: {
  slot: string;
  mode: "adsense" | "preview";
  placement: "session_complete" | "learn_page" | "stats_page" | "settings_page";
}): void {
  trackMonetizationEvent("ad_slot_interaction", {
    placement: input.placement,
    slot: input.slot,
    mode: input.mode,
  });
}

export function getMonetizationTelemetryWarnings(): string[] {
  if (!telemetryEnabled) return [];
  if (!telemetryEndpointRaw || telemetryEndpoint) return [];

  return [
    "NEXT_PUBLIC_MONETIZATION_TELEMETRY_ENDPOINT が不正です。http(s) URL を設定してください。",
  ];
}
