import { BUSINESS } from "@/lib/constants";
import type { Vehicle } from "@/lib/types/vehicle";
import type { GeoLocation } from "@/lib/geo/locations";

export function getLocationUrl(slug: string): string {
  return `${BUSINESS.website}/locations/${slug}`;
}

/** Page title; the root layout template appends the brand. */
export function getGeoPrimaryTitle(location: GeoLocation): string {
  return location.distanceMiles > 0
    ? `Used Cars Near ${location.city}, ${location.stateAbbr}`
    : `Used Cars in ${location.city}, ${location.stateAbbr}`;
}

export function getGeoInventoryHeading(location: GeoLocation): string {
  return `Popular inventory for shoppers near ${location.city}`;
}

export function pickNearbyLocations(current: GeoLocation, locations: GeoLocation[]): GeoLocation[] {
  const sameState = locations.filter((location) => location.slug !== current.slug && location.stateAbbr === current.stateAbbr);
  return sameState.slice(0, 3);
}

export function pickNearbyInventory(location: GeoLocation, vehicles: Vehicle[]): Vehicle[] {
  const preferredMakes = new Set(location.featuredMakes ?? []);
  const scored = vehicles.map((vehicle) => ({
    vehicle,
    score: (preferredMakes.has(vehicle.make) ? 3 : 0) + (vehicle.isFeatured ? 2 : 0) + (vehicle.isNewArrival ? 1 : 0),
  }));

  return scored
    .sort((a, b) => b.score - a.score || b.vehicle.year - a.vehicle.year)
    .slice(0, 6)
    .map((entry) => entry.vehicle);
}
