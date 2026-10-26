import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import type { GeoLocation } from "@/lib/geo/locations";

export function LocationHero({ location }: { location: GeoLocation }) {
  return (
    <PageHero
      eyebrow={`Serving ${location.displayName}`}
      title={`Used Cars ${location.distanceMiles > 0 ? "Near" : "in"} ${location.city}, ${location.stateAbbr}`}
      subtitle={
        location.distanceMiles > 0
          ? `Browse quality used cars, flexible financing, and trade-in support at our Paterson showroom, about ${location.distanceMiles} miles from ${location.city}.`
          : `Browse quality used cars, flexible financing, and trade-in support at our showroom in ${location.city}.`
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button href="/inventory" size="lg">
          Browse Inventory <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/finance" variant="outline" size="lg">Apply for Financing</Button>
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-xs text-zinc-300 border border-white/10 rounded-full px-4 py-2 bg-white/3">
        <CheckCircle2 className="h-3.5 w-3.5 text-accent-light" />
        One showroom in Paterson, NJ — real, in-stock inventory online
      </div>
    </PageHero>
  );
}
