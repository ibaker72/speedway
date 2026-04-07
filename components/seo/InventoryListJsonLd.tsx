import type { Vehicle } from "@/lib/types/vehicle";

interface InventoryListJsonLdProps {
  vehicles: Vehicle[];
  total: number;
}

/**
 * ItemList schema for the inventory page.
 * Each item is typed as a Car offer so Google can surface individual vehicles
 * in automotive rich results.
 */
export function InventoryListJsonLd({ vehicles, total }: InventoryListJsonLdProps) {
  const BASE_URL = "https://www.speedwaymotorsllc.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Used Cars for Sale at Speedway Motors — Paterson, NJ",
    description: `Browse ${total}+ quality pre-owned vehicles at Speedway Motors. Sedans, SUVs, trucks, and vans with flexible financing for all credit levels.`,
    url: `${BASE_URL}/inventory`,
    numberOfItems: total,
    itemListElement: vehicles.slice(0, 10).map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Car",
        "@id": `${BASE_URL}/inventory/${v.slug}`,
        url: `${BASE_URL}/inventory/${v.slug}`,
        name: `${v.year} ${v.make} ${v.model}${v.trim ? " " + v.trim : ""}`.trim(),
        vehicleModelDate: String(v.year),
        brand: { "@type": "Brand", name: v.make },
        model: v.model,
        bodyType: v.bodyType,
        mileageFromOdometer: {
          "@type": "QuantitativeValue",
          value: v.mileage,
          unitCode: "SMI",
        },
        offers: {
          "@type": "Offer",
          price: v.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${BASE_URL}/inventory/${v.slug}`,
          seller: {
            "@type": "AutoDealer",
            name: "Speedway Motors LLC",
          },
        },
        ...(v.images?.[0]?.url && { image: v.images[0].url }),
        ...(v.vin && { vehicleIdentificationNumber: v.vin }),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
