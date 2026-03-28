import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { locations } from "@/lib/data/locations";

const typeLabels: Record<string, string> = {
  showroom: "Main Showroom",
  commercial: "Commercial Department",
  branch: "Branch Location",
};

export function LocationsPreview() {
  return (
    <SectionWrapper background="dark">
      <SectionHeading
        title="Visit Us"
        subtitle="Three locations in Paterson, NJ — all here to serve you."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">
              {typeLabels[loc.type]}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-zinc-300">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-500" />
                <span>
                  {loc.address}
                  <br />
                  {loc.city}, {loc.state} {loc.zip}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-zinc-300">
                <Phone className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                <a href={loc.phoneHref} className="hover:text-white transition-colors">
                  {loc.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-zinc-400">
                <Clock className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                <span>Mon–Sat 9:30 AM – 7:00 PM</span>
              </div>
            </div>

            <a
              href={loc.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-red-400 transition-colors"
            >
              Get Directions
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button href="/contact" variant="outline" size="md" className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white">
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
