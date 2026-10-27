import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildVehicleJsonLd } from "@/lib/seo/schema";
import type { Vehicle } from "@/lib/types/vehicle";

export function VehicleJsonLd({ vehicle }: { vehicle: Vehicle }) {
  return <JsonLdScript data={buildVehicleJsonLd(vehicle)} />;
}
