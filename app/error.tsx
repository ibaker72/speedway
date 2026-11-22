"use client";

import { ErrorFallback } from "@/components/shared/ErrorFallback";

/** Error boundary for pages without their own (e.g. /specials, /compare, /commercial). */
export default function RouteError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <ErrorFallback
      title="Something went wrong"
      message="We couldn't load this page just now. Please try again in a moment, or give us a call."
      retry={unstable_retry}
    />
  );
}
