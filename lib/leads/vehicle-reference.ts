import { getVehicleBySlug } from "@/lib/data/inventory-source";
import { absoluteUrl } from "@/lib/seo/site";
import { vehicleName, vehiclePath } from "@/lib/seo/schema";

export interface LeadVehicle {
  id?: string;
  slug: string;
  title: string | null;
  vin?: string | null;
  stockNumber?: string | null;
  price?: number | null;
  url?: string;
  note?: string;
}

/**
 * Resolves the listing on the server so a lead's vehicle association (ID,
 * VIN, stock number, price) reflects the real listing, never client input.
 */
export async function resolveLeadVehicle(slug: string): Promise<LeadVehicle | null> {
  if (!slug) return null;
  try {
    const match = await getVehicleBySlug(slug);
    if (!match) return { slug, title: null, note: "Listing not found (it may have sold)" };
    return {
      id: match.id,
      slug: match.slug,
      title: vehicleName(match),
      vin: match.vin || null,
      stockNumber: match.stockNumber || null,
      price: match.price > 0 ? match.price : null,
      url: absoluteUrl(vehiclePath(match)),
    };
  } catch {
    return { slug, title: null, note: "Listing lookup failed" };
  }
}
