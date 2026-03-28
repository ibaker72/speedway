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
    <SectionWrapper background="dark">
      <SectionHeading
        title="Visit Us"
        subtitle="Three locations in Paterson, NJ — all here to serve you."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {locations.map((loc, i) => (
          <AnimateIn key={loc.id} delay={i * 120} variant="up">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-7 hover:bg-white/[0.05] hover:border-accent/20 transition-all duration-300 h-full">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">
                {typeLabels[loc.type]}
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 text-sm text-zinc-300">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-500" />
                  <span>
                    {loc.address}
                    <br />
                    {loc.city}, {loc.state} {loc.zip}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-300">
                  <Phone className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <a
                    href={loc.phoneHref}
                    className="hover:text-accent transition-colors"
                  >
                    {loc.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Clock className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <span>Mon–Sat 9:30 AM – 7:00 PM</span>
                </div>
              </div>

              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent transition-colors group"
              >
                Get Directions
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button
          href="/contact"
          variant="outline"
          size="md"
          className="border-zinc-700 text-white hover:bg-white/5 hover:border-zinc-600 hover:text-white"
        >
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
