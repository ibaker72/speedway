import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { locations } from "@/lib/data/locations";

const typeLabels: Record<string, string> = {
  showroom: "Main Showroom",
  commercial: "Commercial Department",
  branch: "Branch Location",
};

export function LocationsPreview() {
  return (
    <SectionWrapper background="charcoal">
      <SectionHeading
        eyebrow="Visit Us"
        title="Come See Us in Person"
        subtitle="Three locations in Paterson, NJ — all here to serve you."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {locations.map((loc, i) => (
          <AnimateIn key={loc.id} delay={i * 80} variant="up">
            <div className="card-glass p-6 h-full">
              <span className="badge-accent text-[10px] mb-4 inline-block">
                {typeLabels[loc.type]}
              </span>

              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-zinc-300">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-500" />
                  <span>
                    {loc.address}, {loc.city}, {loc.state} {loc.zip}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <a
                    href={loc.phoneHref}
                    className="text-zinc-300 hover:text-accent-light transition-colors"
                  >
                    {loc.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>Mon–Sat 9:30 AM – 7:00 PM</span>
                </div>
              </div>

              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-light hover:text-white transition-colors"
              >
                Get Directions
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button href="/contact" variant="outline" size="md">
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
