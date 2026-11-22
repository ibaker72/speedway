"use client";

import { ErrorFallback } from "@/components/shared/ErrorFallback";

export default function InventoryError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <ErrorFallback
      title="Couldn't load inventory"
      message="We had trouble loading our vehicles just now. Please try again in a moment, or call us and we'll check availability for you."
      retry={unstable_retry}
      backHref="/"
      backLabel="Back to the home page"
    />
  );
}
