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
