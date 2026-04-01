import type { Vehicle } from "@/lib/types/vehicle";

interface InventoryListJsonLdProps {
  vehicles: Vehicle[];
  total: number;
}

export function InventoryListJsonLd({ vehicles, total }: InventoryListJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Used Cars for Sale at Speedway Motors — Paterson, NJ",
    numberOfItems: total,
    itemListElement: vehicles.slice(0, 10).map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.speedwaymotorsllc.com/inventory/${v.slug}`,
      name: `${v.year} ${v.make} ${v.model} ${v.trim || ""}`.trim(),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
