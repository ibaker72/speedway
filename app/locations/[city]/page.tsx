import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { LocationCtaStrip } from "@/components/geo/LocationCtaStrip";
import { LocationFaq } from "@/components/geo/LocationFaq";
import { LocationHero } from "@/components/geo/LocationHero";
import { LocationIntro } from "@/components/geo/LocationIntro";
import { LocationTrustSection } from "@/components/geo/LocationTrustSection";
import { NearbyInventory } from "@/components/geo/NearbyInventory";
import { BUSINESS } from "@/lib/constants";
import { getInventory } from "@/lib/data/inventory-source";
import { FAQPageJsonLd } from "@/components/seo/JsonLd";
import { buildDirectionsUrl, buildFaqs, buildLocationIntro, buildLocationMetaDescription } from "@/lib/geo/geo-copy";
import { getGeoInventoryHeading, getGeoPrimaryTitle, getLocationUrl, pickNearbyInventory, pickNearbyLocations } from "@/lib/geo/geo-helpers";
import { pageMetadata } from "@/lib/seo/metadata";
import { geoLocationBySlug, geoLocations } from "@/lib/geo/locations";
import { dealerConfig } from "@/dealer.config";

const mainLocation = dealerConfig.locations[0];

// Pre-rendered for every configured city and refreshed hourly (the nearby
// inventory block is the only part that changes).
export const revalidate = 3600;
// Only the configured cities exist; anything else is a real 404.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return geoLocations.map((location) => ({ city: location.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const location = geoLocationBySlug.get(city);

  if (!location) {
    return { title: "Location Not Found" };
  }

  return pageMetadata({
    title: getGeoPrimaryTitle(location),
    description: buildLocationMetaDescription(location),
    path: `/locations/${location.slug}`,
  });
}

export default async function LocationPage({ params }: PageProps) {
  const { city } = await params;
  const location = geoLocationBySlug.get(city);

  if (!location) {
    notFound();
  }

  const { vehicles } = await getInventory({ perPage: 36, sortBy: "date-added" });
  const localInventory = pickNearbyInventory(location, vehicles);
  const nearbyLocations = pickNearbyLocations(location, geoLocations);
  const faqs = buildFaqs(location);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Locations", url: `${BUSINESS.website}/locations` },
          { name: location.displayName, url: getLocationUrl(location.slug) },
        ]}
      />
      <FAQPageJsonLd faqs={faqs} />

      <LocationHero location={location} />
      <LocationIntro intro={buildLocationIntro(location)} location={location} />
      <NearbyInventory title={getGeoInventoryHeading(location)} city={location.city} vehicles={localInventory} />
      <LocationTrustSection city={location.city} />
      <LocationFaq city={location.city} faqs={faqs} />
      <LocationCtaStrip />

      <SectionWrapper background="elevated">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Dealership contact details</h2>
            <p className="text-sm text-zinc-400">{BUSINESS.name}</p>
            <p className="text-sm text-zinc-400">{mainLocation.address}, {mainLocation.city}, {mainLocation.state} {mainLocation.zip}</p>
            <p className="text-sm text-zinc-300 mt-3">Call: <a href={BUSINESS.phoneHref} data-track-location="location_page" className="text-accent-light hover:text-white">{BUSINESS.phone}</a></p>
            <p className="text-sm text-zinc-300">Email: <a href={`mailto:${BUSINESS.email}`} className="text-accent-light hover:text-white">{BUSINESS.email}</a></p>
            <a
              href={buildDirectionsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-sm font-semibold text-accent-light hover:text-white transition-colors"
            >
              Get directions from {location.city}
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
          </div>

          <div className="card-glass p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Also serving nearby communities</h2>
            <div className="flex flex-wrap gap-2">
              {location.nearbyAreas.map((area) => (
                <span key={area} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-zinc-300 bg-white/3">{area}</span>
              ))}
            </div>
            {nearbyLocations.length > 0 && (
              <div className="mt-4 space-y-2">
                {nearbyLocations.map((nearby) => (
                  <Link key={nearby.slug} href={`/locations/${nearby.slug}`} className="block text-sm text-accent-light hover:text-white transition-colors">
                    Explore used cars near {nearby.displayName}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
