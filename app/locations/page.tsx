import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { serviceAreas } from "@/lib/data/service-areas";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Areas We Serve | Used Cars in Passaic County, NJ",
  description:
    "Speedway Motors serves Paterson, Clifton, Passaic, Wayne, Fair Lawn, and 10+ cities across North Jersey. Find quality used cars near you.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/locations",
  },
};

export default function LocationsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Locations", url: `${BUSINESS.website}/locations` },
        ]}
      />

      <PageHero
        eyebrow="Service Areas"
        title="Proudly Serving North Jersey"
        subtitle="Speedway Motors is located in Paterson, NJ and serves drivers across Passaic County and beyond."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {serviceAreas.map((area, i) => (
            <AnimateIn key={area.slug} delay={i * 60} variant="up">
              <Link
                href={`/locations/${area.slug}`}
                className="card-glass p-6 h-full flex flex-col group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-accent-light" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-accent-light transition-colors">
                      {area.city}, {area.state}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {area.distanceMiles === 0 ? "Home base" : `${area.distanceMiles} miles away`} &middot; {area.county} County
                    </p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1 line-clamp-3">
                  {area.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light group-hover:text-white transition-colors">
                  View {area.city} Page
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </SectionWrapper>

      {/* Map */}
      <SectionWrapper background="dark">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Our Location</h2>
          <div className="rounded-xl overflow-hidden border border-white/[0.08]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d24100!2d-74.1718!3d40.9168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU1JzAwLjUiTiA3NMKwMTAnMTguNSJX!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Speedway Motors location map"
            />
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
