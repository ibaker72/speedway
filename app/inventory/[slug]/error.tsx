"use client";

import { ErrorFallback } from "@/components/shared/ErrorFallback";

export default function VehicleDetailError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <ErrorFallback
      title="Couldn't load this vehicle"
      message="We had trouble loading the vehicle details just now. This doesn't mean it has sold — please try again, or call us to check."
      retry={unstable_retry}
      backLabel="Back to Inventory"
    />
  );
}
