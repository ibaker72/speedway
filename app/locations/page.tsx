import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { geoLocations } from "@/lib/geo/locations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Areas We Serve | Used Cars Near North Jersey & Lower Hudson Valley",
  description:
    "Explore Speedway Motors service areas near Paterson, NJ including Newark, Jersey City, Hoboken, Yonkers, Clifton, and more.",
  alternates: {
    canonical: `${BUSINESS.website}/locations`,
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
        title="Cities We Serve Around Paterson"
        subtitle="Find your nearest Speedway Motors location page with inventory, financing, and trade-in resources tailored to your area."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {geoLocations.map((location, index) => (
            <AnimateIn key={location.slug} delay={index * 60} variant="up">
              <Link href={`/locations/${location.slug}`} className="card-glass p-6 h-full flex flex-col group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4 text-accent-light" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white group-hover:text-accent-light transition-colors">{location.displayName}</h2>
                    <p className="text-xs text-zinc-500">{location.distanceMiles} miles from Speedway Motors</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 flex-1">{location.intro}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light group-hover:text-white transition-colors">
                  View {location.city} Page
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
