import type { Vehicle, VehicleImage, InventoryFilters, InventoryResponse } from "@/lib/types/vehicle";

async function fetchFromLocalJson(): Promise<Vehicle[]> {
  const { allVehicles } = await import("./vehicles-full");
  return allVehicles;
}

async function fetchFromDealerFeed(): Promise<Vehicle[]> {
  const FEED_URL = process.env.DEALER_FEED_URL;
  const FEED_KEY = process.env.DEALER_FEED_API_KEY;
  if (!FEED_URL) throw new Error("DEALER_FEED_URL not configured");
  const res = await fetch(FEED_URL, { headers: FEED_KEY ? { Authorization: `Bearer ${FEED_KEY}` } : {}, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Feed error: ${res.status}`);
  const raw = await res.json();
  return normalizeVehicles(raw);
}

async function fetchFromAggregator(): Promise<Vehicle[]> { throw new Error("Aggregator not configured"); }

function normalizeVehicles(raw: Record<string, unknown>[]): Vehicle[] {
  return raw.map((item: Record<string, unknown>) => ({
    id: String(item.id || item.stock_number || ""), slug: generateSlug(item), stockNumber: String(item.stock_number || item.stockNumber || ""), vin: String(item.vin || ""), year: Number(item.year), make: String(item.make || ""), model: String(item.model || ""), trim: item.trim ? String(item.trim) : undefined, bodyType: mapBodyType(String(item.body_type || item.bodyType || "")), condition: "used" as const, price: Number(item.price || item.internet_price || 0), msrp: item.msrp ? Number(item.msrp) : undefined, internetPrice: item.internet_price ? Number(item.internet_price) : undefined, mileage: Number(item.mileage || item.odometer || 0), exteriorColor: String(item.exterior_color || item.exteriorColor || ""), interiorColor: String(item.interior_color || item.interiorColor || ""), transmission: mapTransmission(String(item.transmission || "")), drivetrain: mapDrivetrain(String(item.drivetrain || item.drive_type || "")), engine: String(item.engine || ""), fuelType: mapFuelType(String(item.fuel_type || item.fuelType || "")), images: mapImages(item.images || item.photos || []), thumbnailUrl: item.thumbnail ? String(item.thumbnail) : undefined, description: item.description ? String(item.description) : undefined, features: Array.isArray(item.features) ? item.features.map(String) : [], isCommercial: Boolean(item.is_commercial || item.isCommercial), isFeatured: Boolean(item.is_featured || item.isFeatured), isNewArrival: Boolean(item.is_new_arrival), isSold: Boolean(item.is_sold || item.sold), dateAdded: String(item.date_added || item.created_at || new Date().toISOString()),
  }));
}

function generateSlug(item: Record<string, unknown>): string {
  return [item.year, item.make, item.model, item.trim].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
}

function mapBodyType(raw: string): Vehicle["bodyType"] {
  const l = raw.toLowerCase();
  if (l.includes("sedan") || l.includes("car")) return "sedan";
  if (l.includes("suv") || l.includes("crossover") || l.includes("sport utility")) return "suv";
  if (l.includes("truck") || l.includes("pickup")) return "truck";
  if (l.includes("van") || l.includes("minivan")) return "van";
  if (l.includes("coupe")) return "coupe";
  if (l.includes("wagon")) return "wagon";
  if (l.includes("convertible")) return "convertible";
  if (l.includes("hatchback")) return "hatchback";
  if (l.includes("commercial")) return "commercial";
  return "sedan";
}

function mapTransmission(raw: string): Vehicle["transmission"] {
  const l = raw.toLowerCase();
  if (l.includes("manual") || l.includes("stick")) return "Manual";
  if (l.includes("cvt")) return "CVT";
  return "Automatic";
}

function mapDrivetrain(raw: string): Vehicle["drivetrain"] {
  const l = raw.toLowerCase();
  if (l.includes("awd") || l.includes("all wheel")) return "AWD";
  if (l.includes("4wd") || l.includes("4x4")) return "4WD";
  if (l.includes("rwd") || l.includes("rear wheel")) return "RWD";
  return "FWD";
}

function mapFuelType(raw: string): Vehicle["fuelType"] {
  const l = raw.toLowerCase();
  if (l.includes("diesel")) return "Diesel";
  if (l.includes("hybrid")) return "Hybrid";
  if (l.includes("electric") || l.includes("ev")) return "Electric";
  if (l.includes("flex")) return "Flex Fuel";
  return "Gasoline";
}

function mapImages(raw: unknown): VehicleImage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((img: unknown, i: number) => {
    if (typeof img === "string") return { url: img, alt: "", isPrimary: i === 0 };
    const obj = img as Record<string, unknown>;
    return { url: String(obj.url || obj.src || obj.image_url || ""), alt: String(obj.alt || obj.caption || ""), isPrimary: i === 0 };
  }).filter((img) => img.url);
}

function buildFilterOptions(vehicles: Vehicle[]) {
  const makes = new Map<string, number>();
  const bodyTypes = new Map<string, number>();
  let minYear = 9999, maxYear = 0;
  for (const v of vehicles) {
    makes.set(v.make, (makes.get(v.make) || 0) + 1);
    bodyTypes.set(v.bodyType, (bodyTypes.get(v.bodyType) || 0) + 1);
    if (v.year < minYear) minYear = v.year;
    if (v.year > maxYear) maxYear = v.year;
  }
  const priceRanges = [
    { label: "Under $10K", min: 0, max: 10000, count: vehicles.filter((v) => v.price < 10000).length },
    { label: "$10K–$15K", min: 10000, max: 15000, count: vehicles.filter((v) => v.price >= 10000 && v.price < 15000).length },
    { label: "$15K–$20K", min: 15000, max: 20000, count: vehicles.filter((v) => v.price >= 15000 && v.price < 20000).length },
    { label: "$20K–$30K", min: 20000, max: 30000, count: vehicles.filter((v) => v.price >= 20000 && v.price < 30000).length },
    { label: "$30K+", min: 30000, max: 999999, count: vehicles.filter((v) => v.price >= 30000).length },
  ];
  return {
    makes: [...makes.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    bodyTypes: [...bodyTypes.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    priceRanges,
    yearRange: { min: minYear, max: maxYear },
  };
}

export async function getInventory(filters: InventoryFilters = {}): Promise<InventoryResponse> {
  const source = process.env.INVENTORY_SOURCE || "local";
  let vehicles: Vehicle[];
  switch (source) {
    case "feed": vehicles = await fetchFromDealerFeed(); break;
    case "aggregator": vehicles = await fetchFromAggregator(); break;
    default: vehicles = await fetchFromLocalJson();
  }
  vehicles = vehicles.filter((v) => !v.isSold);
  if (filters.isCommercial !== undefined) vehicles = vehicles.filter((v) => v.isCommercial === filters.isCommercial);
  if (filters.search) { const q = filters.search.toLowerCase(); vehicles = vehicles.filter((v) => `${v.year} ${v.make} ${v.model} ${v.trim || ""}`.toLowerCase().includes(q)); }
  if (filters.make) vehicles = vehicles.filter((v) => v.make.toLowerCase() === filters.make!.toLowerCase());
  if (filters.bodyType) vehicles = vehicles.filter((v) => v.bodyType === filters.bodyType);
  if (filters.minPrice) vehicles = vehicles.filter((v) => v.price >= filters.minPrice!);
  if (filters.maxPrice) vehicles = vehicles.filter((v) => v.price <= filters.maxPrice!);
  if (filters.minYear) vehicles = vehicles.filter((v) => v.year >= filters.minYear!);
  if (filters.maxYear) vehicles = vehicles.filter((v) => v.year <= filters.maxYear!);
  if (filters.maxMileage) vehicles = vehicles.filter((v) => v.mileage <= filters.maxMileage!);
  if (filters.drivetrain) vehicles = vehicles.filter((v) => v.drivetrain === filters.drivetrain);
  const filterOptions = buildFilterOptions(vehicles);
  switch (filters.sortBy) {
    case "price-asc": vehicles.sort((a, b) => a.price - b.price); break;
    case "price-desc": vehicles.sort((a, b) => b.price - a.price); break;
    case "year-asc": vehicles.sort((a, b) => a.year - b.year); break;
    case "year-desc": vehicles.sort((a, b) => b.year - a.year); break;
    case "mileage-asc": vehicles.sort((a, b) => a.mileage - b.mileage); break;
    default: vehicles.sort((a, b) => b.year - a.year);
  }
  const page = filters.page || 1;
  const perPage = filters.perPage || 24;
  const total = vehicles.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  vehicles = vehicles.slice(start, start + perPage);
  return { vehicles, total, page, perPage, totalPages, filters: filterOptions };
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const { vehicles } = await getInventory({ perPage: 999 });
  return vehicles.find((v) => v.slug === slug) || null;
}
