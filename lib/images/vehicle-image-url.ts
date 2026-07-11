/**
 * Shared vehicle-image URL normalization and validation.
 *
 * Every image URL that reaches the browser flows through here — both at
 * import time (Autofunds feed → Supabase) and at read time (Supabase →
 * page props). Centralizing the rules keeps the importer, the inventory
 * mappers, and the hero/thumbnail pickers in agreement about what a
 * renderable image URL is.
 *
 * Rules:
 *  - Trim whitespace and wrapping quotes; decode basic HTML entities.
 *  - Local public assets ("/images/foo.jpg") pass through untouched.
 *  - Protocol-relative URLs ("//host/img.jpg") resolve to https.
 *  - http:// upgrades to https:// (all approved hosts serve HTTPS; this
 *    avoids mixed content).
 *  - javascript:, data:, file:, ftp: and any other non-HTTP(S) protocol
 *    are rejected, as are localhost and bare-IP hosts.
 *  - Hostname must match the approved host list, which mirrors
 *    images.remotePatterns in next.config.ts — anything else would 400 at
 *    /_next/image anyway, so it is dropped here where callers can fall
 *    back cleanly instead of rendering a broken <img>.
 *  - Decommissioned Autofunds CDN hostnames (InvImg*.autofunds.net) are
 *    rewritten to images.autofunds.net, which still serves the same
 *    paths. (AutoFunds retired the InvImg* hosts in June 2026; the old
 *    hosts return 404 for every path.)
 *  - Path and query string are preserved exactly.
 *
 * Returns null for anything unusable so callers can fall back to the
 * camera placeholder instead of emitting a URL that will fail in the
 * browser.
 */

/** Mirrors images.remotePatterns in next.config.ts. Update both together. */
const APPROVED_IMAGE_HOSTS: RegExp[] = [
  /\.cloudfront\.net$/,
  /\.imgix\.net$/,
  /^images\.dealer\.com$/,
  /^pictures\.dealer\.com$/,
  /^vehicle-photos-published\.vauto\.com$/,
  /^placehold\.co$/,
  /\.dealereprocess\.com$/,
  /\.dealercloud\.com$/,
  /\.izmo\.com$/,
  /\.autofunds\.net$/,
];

/**
 * Hosts that no longer resolve to live images but whose paths are still
 * served verbatim by a current host. Only add entries here once the
 * replacement host has been verified to serve the same paths.
 */
const LEGACY_HOST_REWRITES: { pattern: RegExp; replacement: string }[] = [
  // AutoFunds retired the InvImg* image hosts (InvImg2B, etc.) in favor of
  // images.autofunds.net; identical paths, old hosts 404 on everything.
  { pattern: /^invimg[a-z0-9]*\.autofunds\.net$/, replacement: "images.autofunds.net" },
];

/** Decode the handful of HTML entities that show up in feed/export URLs. */
function decodeBasicEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

export function normalizeVehicleImageUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;

  let s = input.trim();
  // Strip wrapping straight/smart quotes left over from CSV quoting.
  s = s
    .replace(/^['"‘’“”]+/, "")
    .replace(/['"‘’“”]+$/, "")
    .trim();
  if (!s) return null;

  if (/&(amp|quot|apos|#\d+|#x[0-9a-f]+);/i.test(s)) {
    s = decodeBasicEntities(s);
  }

  // Same-origin public assets are always fine — leave them alone.
  if (s.startsWith("/") && !s.startsWith("//")) return s;

  // Known protocol-relative form: resolve to https.
  if (s.startsWith("//")) s = `https:${s}`;

  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return null;
  }

  // Upgrade http → https (approved hosts all serve HTTPS); everything
  // else — javascript:, data:, file:, ftp:, blob: — is rejected.
  if (url.protocol === "http:") url.protocol = "https:";
  if (url.protocol !== "https:") return null;

  const host = url.hostname; // URL() lowercases the hostname
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.startsWith("[") // IPv6 literal
  ) {
    return null;
  }

  const legacy = LEGACY_HOST_REWRITES.find((r) => r.pattern.test(host));
  if (legacy) url.hostname = legacy.replacement;

  if (!APPROVED_IMAGE_HOSTS.some((re) => re.test(url.hostname))) return null;

  return url.toString();
}

/** First entry of `urls` that normalizes to a usable URL, or null. */
export function pickFirstValidImageUrl(urls: readonly unknown[]): string | null {
  for (const candidate of urls) {
    const normalized = normalizeVehicleImageUrl(candidate);
    if (normalized) return normalized;
  }
  return null;
}
