import type { BodyType, Drivetrain, FuelType, TransmissionType, VehicleSpecs } from "@/lib/inventory/specs";

/**
 * A listing as the site renders it. Spec fields are optional: unknown or
 * contradictory feed data is omitted rather than defaulted (see
 * lib/inventory/specs.ts). `specs` carries the full normalized detail.
 */
export interface Vehicle {
  id: string;
  slug: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyType?: BodyType;
  condition: "used" | "certified";
  price: number;
  msrp?: number;
  internetPrice?: number;
  mileage: number;
  exteriorColor?: string;
  interiorColor?: string;
  transmission?: TransmissionType;
  drivetrain?: Drivetrain;
  /** Formatted engine label, e.g. "3.6L V6". */
  engine?: string;
  fuelType?: FuelType;
  specs?: VehicleSpecs;
  cylinders?: number;
  doors?: number;
  passengers?: number;
  images: VehicleImage[];
  thumbnailUrl?: string;
  description?: string;
  descriptionSource?: "manual" | "feed" | "generated";
  /** Short dealer comment shown alongside a description from another source. */
  dealerNote?: string;
  features: string[];
  highlights?: string[];
  isCommercial: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSold: boolean;
  dateAdded: string;
  dateModified?: string;
  estimatedPayment?: number;
}

export interface VehicleImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  width?: number;
  height?: number;
}

export type InventorySortBy = "price-asc" | "price-desc" | "year-desc" | "year-asc" | "mileage-asc" | "newest" | "date-added";

export type KeyFeatureOption =
  | "Apple CarPlay"
  | "Sunroof"
  | "3rd Row Seating"
  | "Navigation"
  | "Heated Seats"
  | "Backup Camera"
  | "Bluetooth"
  | "Remote Start";

export type TrustBadgeType = "one-owner" | "clean-carfax" | "low-mileage" | "price-drop" | "recent-arrival";

export interface TrustBadge {
  type: TrustBadgeType;
  label: string;
}

export interface InventoryFilters {
  search?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minMileage?: number;
  maxMileage?: number;
  features?: KeyFeatureOption[];
  drivetrain?: string;
  fuelType?: string;
  isCommercial?: boolean;
  sortBy?: InventorySortBy;
  page?: number;
  perPage?: number;
}

export interface InventoryResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  filters: {
    makes: { name: string; count: number }[];
    models: { name: string; count: number }[];
    bodyTypes: { name: string; count: number }[];
    priceRanges: { label: string; min: number; max: number; count: number }[];
    yearRange: { min: number; max: number };
  };
}
