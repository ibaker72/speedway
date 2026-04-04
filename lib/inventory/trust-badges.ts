import { LOW_MILEAGE_THRESHOLD } from "@/lib/inventory/constants";
import type { TrustBadge, Vehicle } from "@/lib/types/vehicle";

export function getVehicleTrustBadges(vehicle: Vehicle): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (vehicle.isNewArrival) {
    badges.push({ type: "recent-arrival", label: "Recent Arrival" });
  }

  if (vehicle.msrp && vehicle.price < vehicle.msrp) {
    badges.push({ type: "price-drop", label: "Price Drop" });
  }

  if (vehicle.mileage <= LOW_MILEAGE_THRESHOLD) {
    badges.push({ type: "low-mileage", label: "Low Mileage" });
  }

  return badges;
}
