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
  const mainLocation = locations.find((l) => l.type === "showroom")!;

  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Visit Speedway Motors"
        subtitle="Three locations in Paterson, NJ — all here to serve you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-zinc-200 h-[300px] lg:h-full min-h-[300px]">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3017.8!2d${mainLocation.coordinates.lng}!3d${mainLocation.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU1JzAwLjUiTiA3NMKwMTAnMTguNSJX!5e0!3m2!1sen!2sus!4v1`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Speedway Motors location map"
          />
        </div>

        {/* Location cards */}
        <div className="space-y-4">
          {locations.map((loc, i) => (
            <AnimateIn key={loc.id} delay={i * 80} variant="up">
              <div className="rounded-lg border border-zinc-200 p-6 bg-white hover:shadow-md transition-shadow">
                <div className="text-sm font-bold uppercase tracking-wider text-red-600 mb-3">
                  {typeLabels[loc.type]}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 text-sm text-zinc-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-400" />
                    <span>
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Phone className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <a
                      href={loc.phoneHref}
                      className="hover:text-red-600 transition-colors"
                    >
                      {loc.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <Clock className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <span>Mon–Sat 9:30 AM – 7:00 PM</span>
                  </div>
                </div>

                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
                >
                  Get Directions
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button href="/contact" variant="secondary" size="md">
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
