import type { GeoLocation } from "@/lib/geo/locations";
import { dealerConfig } from "@/dealer.config";

interface Props {
  location: GeoLocation;
}

/**
 * Per-city LocalBusiness schema for geo landing pages.
 * Adds GeoCircle service area and city-specific areaServed so Google
 * understands this page is relevant to buyers in that specific market.
 */
export function LocalBusinessJsonLd({ location }: Props) {
  const { stats } = dealerConfig;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["AutoDealer", "LocalBusiness"],
    "@id": `https://www.speedwaymotorsllc.com/locations/${location.slug}#localbusiness`,
    name: "Speedway Motors LLC",
    url: `https://www.speedwaymotorsllc.com/locations/${location.slug}`,
    telephone: "+1-862-264-2777",
    email: "info@speedwaymotorsllc.com",
    image: "https://www.speedwaymotorsllc.com/og-image.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "302-304 22nd Ave",
      addressLocality: "Paterson",
      addressRegion: "NJ",
      postalCode: "07513",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.9168",
      longitude: "-74.1718",
    },
    // Service area as a circle — 30-mile radius covers entire NJ/NY metro target
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: "40.9168",
          longitude: "-74.1718",
        },
        geoRadius: "48280", // 30 miles in meters
      },
      {
        "@type": "City",
        name: location.city,
        containedInPlace: {
          "@type": "State",
          name: location.state,
        },
      },
      // Also mark the nearby areas as served
      ...location.nearbyAreas.map((area) => ({
        "@type": "City",
        name: area,
        containedInPlace: {
          "@type": "State",
          name: location.state,
        },
      })),
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(stats.googleRating),
      reviewCount: String(stats.totalReviews),
      bestRating: "5",
      worstRating: "1",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:30",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "00:00",
        closes: "00:00",
      },
    ],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Used Car Sales" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Auto Financing" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Vehicle Trade-In" } },
    ],
    // Include coordinates of the target city if available
    ...(location.coordinates && {
      containedInPlace: {
        "@type": "City",
        name: location.city,
        containedInPlace: { "@type": "State", name: location.state },
        geo: {
          "@type": "GeoCoordinates",
          latitude: String(location.coordinates.lat),
          longitude: String(location.coordinates.lng),
        },
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
