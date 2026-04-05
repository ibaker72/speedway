// NOTE: This in-memory rate limiter does not persist across serverless
// invocations or multiple instances. For production at scale, replace with a
// Supabase-backed counter, Vercel KV, or use Vercel's built-in rate limiting headers.
const recentRequests = new Map<string, number[]>();

export function isRateLimited(key: string, windowMs = 60_000, maxRequests = 12) {
  const now = Date.now();
  const bucket = recentRequests.get(key) || [];
  const pruned = bucket.filter((value) => now - value < windowMs);
  if (pruned.length >= maxRequests) {
    recentRequests.set(key, pruned);
    return true;
  }
  pruned.push(now);
  recentRequests.set(key, pruned);
  return false;
}
