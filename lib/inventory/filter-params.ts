import type { InventoryFilters, InventorySortBy, KeyFeatureOption } from "@/lib/types/vehicle";
import { KEY_FEATURE_OPTIONS } from "@/lib/inventory/constants";

export type InventorySearchParams = Record<string, string | string[] | undefined>;

const SORT_OPTIONS: InventorySortBy[] = ["newest", "price-asc", "price-desc", "mileage-asc", "year-desc", "year-asc", "date-added"];

function parseNumber(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function sanitizeRange(min?: number, max?: number): { min?: number; max?: number } {
  if (min !== undefined && max !== undefined && min > max) {
    return { min, max: undefined };
  }
  return { min, max };
}

export function parseInventoryFilters(params: InventorySearchParams): InventoryFilters {
  const minPrice = parseNumber(params.priceMin);
  const maxPrice = parseNumber(params.priceMax);
  const minYear = parseNumber(params.yearMin);
  const maxYear = parseNumber(params.yearMax);
  const minMileage = parseNumber(params.mileageMin);
  const maxMileage = parseNumber(params.mileageMax);

  const parsedFeatures = Array.isArray(params.feature)
    ? params.feature
    : typeof params.feature === "string"
      ? [params.feature]
      : [];

  const featureSet = new Set(KEY_FEATURE_OPTIONS);
  const features = parsedFeatures.filter((feature): feature is KeyFeatureOption => featureSet.has(feature as KeyFeatureOption));

  const sortValue = typeof params.sort === "string" ? params.sort : "newest";
  const sortBy = SORT_OPTIONS.includes(sortValue as InventorySortBy) ? (sortValue as InventorySortBy) : "newest";

  const sanitizedPrice = sanitizeRange(minPrice, maxPrice);
  const sanitizedYear = sanitizeRange(minYear, maxYear);
  const sanitizedMileage = sanitizeRange(minMileage, maxMileage);

  return {
    search: typeof params.search === "string" ? params.search : undefined,
    make: typeof params.make === "string" ? params.make : undefined,
    model: typeof params.model === "string" ? params.model : undefined,
    bodyType: typeof params.type === "string" ? params.type : undefined,
    minPrice: sanitizedPrice.min,
    maxPrice: sanitizedPrice.max,
    minYear: sanitizedYear.min,
    maxYear: sanitizedYear.max,
    minMileage: sanitizedMileage.min,
    maxMileage: sanitizedMileage.max,
    features,
    drivetrain: typeof params.drivetrain === "string" ? params.drivetrain : undefined,
    sortBy,
    page: parseNumber(params.page) || 1,
    perPage: 24,
  };
}

export function buildInventoryQuery(params: InventorySearchParams): URLSearchParams {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
      continue;
    }
    query.set(key, value);
  }

  return query;
}
