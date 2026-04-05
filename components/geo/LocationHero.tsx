import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import type { GeoLocation } from "@/lib/geo/locations";

export function LocationHero({ location }: { location: GeoLocation }) {
  return (
    <PageHero
      eyebrow={`Serving ${location.displayName}`}
      title={`Used Cars Near ${location.city}, ${location.stateAbbr}`}
      subtitle={`Browse quality used cars, flexible financing, and trade-in support just ${location.distanceMiles} miles from ${location.city}.`}
    >
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button href="/inventory" size="lg">
          Browse Inventory <ArrowRight className="h-4 w-4" />
        </Button>
        <Button href="/finance" variant="outline" size="lg">Apply for Financing</Button>
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-xs text-zinc-300 border border-white/10 rounded-full px-4 py-2 bg-white/3">
        <CheckCircle2 className="h-3.5 w-3.5 text-accent-light" />
        Trusted local dealership with transparent process and real inventory
      </div>
    </PageHero>
  );
}
