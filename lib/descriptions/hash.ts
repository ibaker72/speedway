import { createHash } from "node:crypto";

/** JSON with object keys sorted at every level, so equal data always hashes equally. */
export function canonicalJson(value: unknown): string {
  if (value === undefined) return "null";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

/** Short, stable content hash (sha256, 32 hex chars). Not used for security. */
export function contentHash(value: unknown): string {
  const text = typeof value === "string" ? value : canonicalJson(value);
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}
