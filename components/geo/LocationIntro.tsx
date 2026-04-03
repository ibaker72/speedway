import { SectionWrapper } from "@/components/shared/SectionWrapper";
import type { GeoLocation } from "@/lib/geo/locations";

export function LocationIntro({ intro, location }: { intro: string; location: GeoLocation }) {
  return (
    <SectionWrapper background="charcoal">
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white">Your used car options near {location.displayName}</h2>
        <p className="text-zinc-300 leading-relaxed">{intro}</p>
        <p className="text-zinc-400 leading-relaxed">
          We regularly help shoppers from {location.nearbyAreas.join(", ")} and nearby neighborhoods compare cars, review payment scenarios, and schedule a test drive that fits their week.
        </p>
      </div>
    </SectionWrapper>
  );
}
