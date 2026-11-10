import { cleanText } from "@/lib/leads/sanitize";

/**
 * Campaign attribution sent by lead forms (first-touch, captured client-side
 * by lib/analytics/track.ts captureAttribution). Contains no personal data.
 */
export interface LeadAttribution {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  /** Ad click identifiers (Google, Meta, Microsoft) so ad conversions can be matched. */
  gclid: string | null;
  fbclid: string | null;
  msclkid: string | null;
  landingPage: string | null;
  referrerHost: string | null;
  formPage: string | null;
}

export function parseLeadAttribution(body: Record<string, unknown>): LeadAttribution {
  const a = body.attribution && typeof body.attribution === "object" ? (body.attribution as Record<string, unknown>) : {};
  const text = (value: unknown, max = 100) => cleanText(value, max) || null;
  return {
    utmSource: text(a.utm_source),
    utmMedium: text(a.utm_medium),
    utmCampaign: text(a.utm_campaign),
    utmTerm: text(a.utm_term),
    utmContent: text(a.utm_content),
    gclid: text(a.gclid, 200),
    fbclid: text(a.fbclid, 200),
    msclkid: text(a.msclkid, 200),
    landingPage: text(a.landing_page, 200),
    referrerHost: text(a.referrer_host),
    formPage: text(body.formPage, 200),
  };
}
