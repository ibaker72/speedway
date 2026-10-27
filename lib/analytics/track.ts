/**
 * Conversion event tracking for GA4 (gtag), Google Tag Manager, and the Meta
 * pixel. Each integration only receives events when its script is configured
 * (NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_GTM_ID / NEXT_PUBLIC_FB_PIXEL_ID).
 *
 * Privacy rule: events never carry customer data. Parameters whose names look
 * like personal or financial fields are dropped before anything is sent.
 *
 * Duplicate-tracking note: if both GA_ID and GTM_ID are set and the GTM
 * container also forwards these dataLayer events to GA4, each conversion is
 * counted twice. Configure one path to GA4, not both.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const BLOCKED_PARAM = /name|email|phone|address|zip|postal|income|employer|ssn|birth|dob|message|note|credit/i;

export function sanitizeEventParams(params: EventParams): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || BLOCKED_PARAM.test(key)) continue;
    safe[key] = typeof value === "string" ? value.slice(0, 100) : value;
  }
  return safe;
}

export function trackEvent(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  const safe = sanitizeEventParams(params);
  try {
    if (process.env.NEXT_PUBLIC_GTM_ID) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event, ...safe });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", event, safe);
    }
  } catch {
    // Analytics must never break the page.
  }
}

export type LeadType =
  | "contact"
  | "finance"
  | "test_drive"
  | "trade_in"
  | "sell_car"
  | "shipping"
  | "inventory_alert"
  | "deal_desk";

/** Fires the standard GA4 `generate_lead` event (and a Meta `Lead`) after a successful form submission. */
export function trackLead(leadType: LeadType, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  trackEvent("generate_lead", { lead_type: leadType, page_path: window.location.pathname, ...params });
  try {
    if (typeof window.fbq === "function") window.fbq("track", "Lead", { content_category: leadType });
  } catch {
    // ignore
  }
}

const ATTRIBUTION_KEY = "speedway-attribution";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
  referrer_host?: string;
}

/** Records first-touch campaign data for this browser session (no personal data). */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(ATTRIBUTION_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    let referrerHost: string | undefined;
    try {
      const host = document.referrer ? new URL(document.referrer).host : "";
      referrerHost = host && host !== window.location.host ? host : undefined;
    } catch {
      referrerHost = undefined;
    }
    const attribution: Attribution = {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      landing_page: window.location.pathname,
      referrer_host: referrerHost,
    };
    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Storage can be unavailable (private mode); attribution is optional.
  }
}

export function readAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
