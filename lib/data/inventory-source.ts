import type { Vehicle, VehicleImage, InventoryFilters, InventoryResponse } from "@/lib/types/vehicle";

interface SupabaseVehicleRow {
  id: string;
  slug: string;
  stock_number: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  body_type: string;
  condition: "used" | "certified";
  price: number;
  msrp: number | null;
  internet_price: number | null;
  mileage: number;
  exterior_color: string;
  interior_color: string;
  transmission: string;
  drivetrain: string;
  engine: string;
  fuel_type: string;
  images: unknown;
  thumbnail_url: string | null;
  description: string | null;
  features: string[];
  highlights: string[] | null;
  is_commercial: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_sold: boolean;
  date_added: string;
  date_modified: string | null;
  estimated_payment: number | null;
}

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

function mapSupabaseVehicle(row: SupabaseVehicleRow): Vehicle {
  return {
    id: String(row.id),
    slug: row.slug,
    stockNumber: row.stock_number,
    vin: row.vin,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim || undefined,
    bodyType: mapBodyType(row.body_type),
    condition: row.condition,
    price: row.price,
    msrp: row.msrp ?? undefined,
    internetPrice: row.internet_price ?? undefined,
    mileage: row.mileage,
    exteriorColor: row.exterior_color,
    interiorColor: row.interior_color,
    transmission: mapTransmission(row.transmission),
    drivetrain: mapDrivetrain(row.drivetrain),
    engine: row.engine,
    fuelType: mapFuelType(row.fuel_type),
    images: mapImages(row.images),
    thumbnailUrl: row.thumbnail_url || undefined,
    description: row.description || undefined,
    features: Array.isArray(row.features) ? row.features : [],
    highlights: row.highlights ?? undefined,
    isCommercial: row.is_commercial,
    isFeatured: row.is_featured,
    isNewArrival: row.is_new_arrival,
    isSold: row.is_sold,
    dateAdded: row.date_added,
    dateModified: row.date_modified ?? undefined,
    estimatedPayment: row.estimated_payment ?? undefined,
  };
}

function buildFilterOptions(vehicles: Vehicle[]) {
  const makes = new Map<string, number>();
  const models = new Map<string, number>();
  const bodyTypes = new Map<string, number>();
  let minYear = 9999, maxYear = 0;
  for (const v of vehicles) {
    makes.set(v.make, (makes.get(v.make) || 0) + 1);
    models.set(v.model, (models.get(v.model) || 0) + 1);
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
    models: [...models.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    bodyTypes: [...bodyTypes.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    priceRanges,
    yearRange: { min: minYear === 9999 ? new Date().getFullYear() - 10 : minYear, max: maxYear || new Date().getFullYear() },
  };
}

async function fetchFromSupabase(filters: InventoryFilters): Promise<InventoryResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  const page = filters.page || 1;
  const perPage = filters.perPage || 24;
  const from = (page - 1) * perPage;

  const query = new URLSearchParams();
  query.set("select", "*");
  query.set("is_sold", "eq.false");
  query.set("offset", String(from));
  query.set("limit", String(perPage));

  if (filters.isCommercial !== undefined) query.set("is_commercial", `eq.${filters.isCommercial}`);
  if (filters.make) query.set("make", `eq.${filters.make}`);
  if (filters.model) query.set("model", `eq.${filters.model}`);
  if (filters.bodyType) query.set("body_type", `eq.${filters.bodyType}`);
  const andConditions: string[] = [];
  if (filters.minPrice !== undefined) andConditions.push(`price.gte.${filters.minPrice}`);
  if (filters.maxPrice !== undefined) andConditions.push(`price.lte.${filters.maxPrice}`);
  if (filters.minYear !== undefined) andConditions.push(`year.gte.${filters.minYear}`);
  if (filters.maxYear !== undefined) andConditions.push(`year.lte.${filters.maxYear}`);
  if (filters.minMileage !== undefined) andConditions.push(`mileage.gte.${filters.minMileage}`);
  if (filters.maxMileage !== undefined) andConditions.push(`mileage.lte.${filters.maxMileage}`);
  if (andConditions.length) query.set("and", `(${andConditions.join(",")})`);
  if (filters.drivetrain) query.set("drivetrain", `eq.${filters.drivetrain}`);
  if (filters.features?.length) query.set("features", `cs.{${filters.features.map((f) => `"${f.replace(/"/g, "")}"`).join(",")}}`);
  if (filters.search) query.set("or", `(make.ilike.*${filters.search}*,model.ilike.*${filters.search}*,trim.ilike.*${filters.search}*)`);

  switch (filters.sortBy) {
    case "price-asc": query.set("order", "price.asc"); break;
    case "price-desc": query.set("order", "price.desc"); break;
    case "year-asc": query.set("order", "year.asc"); break;
    case "year-desc": query.set("order", "year.desc"); break;
    case "mileage-asc": query.set("order", "mileage.asc"); break;
    case "date-added": query.set("order", "date_added.desc"); break;
    default: query.set("order", "year.desc");
  }

  const headers: HeadersInit = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: "count=exact",
  };

  const [dataRes, allRes] = await Promise.all([
    fetch(`${url}/rest/v1/inventory?${query.toString()}`, { headers, next: { revalidate: 60 } }),
    fetch(`${url}/rest/v1/inventory?select=*&is_sold=eq.false`, { headers, next: { revalidate: 60 } }),
  ]);

  if (!dataRes.ok) throw new Error(`Supabase query failed: ${dataRes.status}`);
  if (!allRes.ok) throw new Error(`Supabase filter options query failed: ${allRes.status}`);

  const rows = (await dataRes.json()) as SupabaseVehicleRow[];
  const allRows = (await allRes.json()) as SupabaseVehicleRow[];
  const totalHeader = dataRes.headers.get("content-range");
  const total = totalHeader?.split("/")[1] ? Number(totalHeader.split("/")[1]) : rows.length;

  const vehicles = rows.map(mapSupabaseVehicle);
  const filterOptions = buildFilterOptions(allRows.map(mapSupabaseVehicle));

  return {
    vehicles,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    filters: filterOptions,
  };
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

export async function getInventory(filters: InventoryFilters = {}): Promise<InventoryResponse> {
  const source = process.env.INVENTORY_SOURCE || "local";

  if (source === "supabase") {
    return fetchFromSupabase(filters);
  }

  let vehicles: Vehicle[];
  switch (source) {
    case "feed": vehicles = await fetchFromDealerFeed(); break;
    case "aggregator": vehicles = await fetchFromAggregator(); break;
    default: vehicles = await fetchFromLocalJson();
  }

  vehicles = vehicles.filter((v) => !v.isSold);
  if (filters.isCommercial !== undefined) vehicles = vehicles.filter((v) => v.isCommercial === filters.isCommercial);
  if (filters.search) { const q = filters.search.toLowerCase(); vehicles = vehicles.filter((v) => `${v.year} ${v.make} ${v.model} ${v.trim || ""}`.toLowerCase().includes(q)); }
  if (filters.make) vehicles = vehicles.filter((v) => v.make.toLowerCase() === filters.make.toLowerCase());
  if (filters.model) vehicles = vehicles.filter((v) => v.model.toLowerCase() === filters.model.toLowerCase());
  if (filters.bodyType) vehicles = vehicles.filter((v) => v.bodyType === filters.bodyType);
  if (filters.minPrice !== undefined) vehicles = vehicles.filter((v) => v.price >= filters.minPrice);
  if (filters.maxPrice !== undefined) vehicles = vehicles.filter((v) => v.price <= filters.maxPrice);
  if (filters.minYear !== undefined) vehicles = vehicles.filter((v) => v.year >= filters.minYear);
  if (filters.maxYear !== undefined) vehicles = vehicles.filter((v) => v.year <= filters.maxYear);
  if (filters.minMileage !== undefined) vehicles = vehicles.filter((v) => v.mileage >= filters.minMileage);
  if (filters.maxMileage !== undefined) vehicles = vehicles.filter((v) => v.mileage <= filters.maxMileage);
  if (filters.drivetrain) vehicles = vehicles.filter((v) => v.drivetrain === filters.drivetrain);
  if (filters.features?.length) vehicles = vehicles.filter((v) => filters.features!.every((f) => v.features.some((vf) => vf.toLowerCase().includes(f.toLowerCase()))));

  const filterOptions = buildFilterOptions(vehicles);
  switch (filters.sortBy) {
    case "price-asc": vehicles.sort((a, b) => a.price - b.price); break;
    case "price-desc": vehicles.sort((a, b) => b.price - a.price); break;
    case "year-asc": vehicles.sort((a, b) => a.year - b.year); break;
    case "year-desc": vehicles.sort((a, b) => b.year - a.year); break;
    case "mileage-asc": vehicles.sort((a, b) => a.mileage - b.mileage); break;
    case "date-added": vehicles.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); break;
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
