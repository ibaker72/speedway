import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { absoluteUrl } from "@/lib/seo/site";
import { vehicleName, vehiclePath } from "@/lib/seo/schema";
import type { Vehicle } from "@/lib/types/vehicle";

interface InventoryListJsonLdProps {
  vehicles: Vehicle[];
  name: string;
  /** Site-relative path of the listing page. */
  path: string;
}

/**
 * ItemList summary for an inventory listing page: points to each vehicle's
 * detail page, where the full Car markup lives.
 */
export function InventoryListJsonLd({ vehicles, name, path }: InventoryListJsonLdProps) {
  if (!vehicles.length) return null;
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        url: absoluteUrl(path),
        numberOfItems: vehicles.length,
        itemListElement: vehicles.map((vehicle, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(vehiclePath(vehicle)),
          name: vehicleName(vehicle),
        })),
      }}
    />
  );
}
