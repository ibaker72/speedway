// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { InventoryUnavailableError, getInventory, getInventoryOrEmpty, getVehicleBySlug } from "@/lib/data/inventory-source";
import { resetCircuitBreaker } from "@/lib/server/resilient-fetch";

function otherSideClosed() {
  return new TypeError("fetch failed", { cause: Object.assign(new Error("other side closed"), { code: "UND_ERR_SOCKET" }) });
}

function row(id: string, price: number, extra: Record<string, unknown> = {}) {
  return {
    id,
    slug: `car-${id}`,
    stock_number: `S${id}`,
    vin: `VIN${id}`,
    year: 2020,
    make: "Honda",
    model: "Civic",
    trim: null,
    body_type: "sedan",
    condition: "used",
    price,
    msrp: null,
    internet_price: null,
    mileage: 10000,
    exterior_color: "Blue",
    interior_color: "Black",
    transmission: "",
    drivetrain: "",
    engine: "",
    fuel_type: "",
    images: [],
    thumbnail_url: null,
    description: null,
    features: [],
    highlights: null,
    is_commercial: false,
    is_featured: false,
    is_new_arrival: false,
    is_sold: false,
    date_added: "2026-11-01",
    date_modified: null,
    estimated_payment: null,
    ...extra,
  };
}

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, ...init, headers: { "content-type": "application/json", ...(init.headers ?? {}) } });

describe("inventory reads under Supabase failures", () => {
  const env = { ...process.env };
  beforeEach(() => {
    resetCircuitBreaker();
    process.env.INVENTORY_SOURCE = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("recovers the listing after a dropped connection instead of showing 0 vehicles", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        calls++;
        if (calls === 1) throw otherSideClosed();
        if (url.includes("offset=")) return json([row("1", 20000)], { headers: { "content-range": "0-0/1" } });
        return json([{ make: "Honda", model: "Civic", body_type: "sedan", price: 20000, year: 2020 }]);
      })
    );
    const result = await getInventory({ page: 1, perPage: 24 });
    expect(result.vehicles.map((v) => v.id)).toEqual(["1"]);
    expect(result.total).toBe(1);
  });

  it("reports a persistent outage (exhausted retries, Supabase 500) instead of an empty inventory", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(otherSideClosed()));
    await expect(getInventory({})).rejects.toBeInstanceOf(InventoryUnavailableError);

    resetCircuitBreaker();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ message: "boom" }, { status: 500 })));
    await expect(getInventory({})).rejects.toBeInstanceOf(InventoryUnavailableError);
  });

  it("lets secondary sections degrade to empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ message: "boom" }, { status: 503 })));
    const result = await getInventoryOrEmpty({ perPage: 6 });
    expect(result.vehicles).toEqual([]);
  });

  it("does not turn a database failure into a false 'no longer available' 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ message: "boom" }, { status: 500 })));
    await expect(getVehicleBySlug("car-1")).rejects.toBeInstanceOf(InventoryUnavailableError);

    // Invalid credentials: a real error, reported without retrying.
    const unauthorized = vi.fn().mockResolvedValue(json({ message: "Invalid API key" }, { status: 401 }));
    vi.stubGlobal("fetch", unauthorized);
    await expect(getVehicleBySlug("car-1")).rejects.toBeInstanceOf(InventoryUnavailableError);
    expect(unauthorized).toHaveBeenCalledTimes(1);
  });

  it("still returns null (→ 404) for a vehicle that is sold or missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json([])));
    await expect(getVehicleBySlug("sold-car")).resolves.toBeNull();
  });

  it("retries a vehicle lookup after a timeout-style failure", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(otherSideClosed()).mockResolvedValueOnce(json([row("7", 15000)]));
    vi.stubGlobal("fetch", fetchMock);
    expect((await getVehicleBySlug("car-7"))?.id).toBe("7");
  });
});

describe("price sorting with Call for Price vehicles", () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  /** A tiny PostgREST stand-in: honours price=gt.0 / call-for-price `and`, order, offset, limit, count. */
  function stubInventory(rows: ReturnType<typeof row>[]) {
    const requests: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        const url = new URL(input);
        requests.push(url.search);
        const p = url.searchParams;
        if (!p.has("offset")) return json(rows.map((r) => ({ make: r.make, model: r.model, body_type: r.body_type, price: r.price, year: r.year })));
        let matched = rows;
        if (p.getAll("price").includes("gt.0")) matched = matched.filter((r) => r.price > 0);
        if (p.get("and")?.includes("or(price.is.null,price.lte.0)")) matched = matched.filter((r) => !(r.price > 0));
        const order = p.get("order") ?? "";
        matched = [...matched].sort((a, b) => (order.startsWith("price.asc") ? a.price - b.price : 0) || a.id.localeCompare(b.id));
        const offset = Number(p.get("offset"));
        const limit = Number(p.get("limit"));
        if (offset > 0 && offset >= matched.length) return json({ code: "PGRST103" }, { status: 416, headers: { "content-range": `*/${matched.length}` } });
        return json(matched.slice(offset, offset + limit), { headers: { "content-range": `${offset}-${offset + limit - 1}/${matched.length}` } });
      })
    );
    return requests;
  }

  it("lists priced vehicles low to high, then Call for Price, across page boundaries", async () => {
    process.env.INVENTORY_SOURCE = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    stubInventory([row("a", 0), row("b", 25000), row("c", 9000), row("d", 0), row("e", 15000)]);

    const page1 = await getInventory({ sortBy: "price-asc", page: 1, perPage: 2 });
    const page2 = await getInventory({ sortBy: "price-asc", page: 2, perPage: 2 });
    const page3 = await getInventory({ sortBy: "price-asc", page: 3, perPage: 2 });
    expect([...page1.vehicles, ...page2.vehicles, ...page3.vehicles].map((v) => v.id)).toEqual(["c", "e", "b", "a", "d"]);
    expect(page1.total).toBe(5);
    expect(page2.total).toBe(5);
    expect(page3.totalPages).toBe(3);
  });

  it("keeps descending price sort and other filters working", async () => {
    process.env.INVENTORY_SOURCE = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    const requests = stubInventory([row("a", 0), row("b", 25000)]);
    await getInventory({ sortBy: "price-desc", search: "civic", minYear: 2015 });
    const listing = new URLSearchParams(requests.find((r) => r.includes("offset")));
    expect(listing.get("order")).toBe("price.desc,id.asc");
    expect(listing.get("or")).toBe("(make.ilike.*civic*,model.ilike.*civic*,trim.ilike.*civic*)");

    requests.length = 0;
    await getInventory({ sortBy: "price-asc", search: "civic", minYear: 2015 });
    const callForPrice = new URLSearchParams(requests.find((r) => r.includes("or%28price.is.null")));
    // The search and year filter still apply to the Call for Price part.
    expect(callForPrice.get("and")).toBe("(year.gte.2015,or(make.ilike.*civic*,model.ilike.*civic*,trim.ilike.*civic*),or(price.is.null,price.lte.0))");
    expect(callForPrice.get("or")).toBeNull();
  });

  it("sorts the local inventory the same way", async () => {
    process.env.INVENTORY_SOURCE = "local";
    const { vehicles } = await getInventory({ sortBy: "price-asc", perPage: 999 });
    const prices = vehicles.map((v) => v.price);
    const firstUnpriced = prices.findIndex((p) => !(p > 0));
    const priced = firstUnpriced === -1 ? prices : prices.slice(0, firstUnpriced);
    expect(priced).toEqual([...priced].sort((a, b) => a - b));
    if (firstUnpriced !== -1) expect(prices.slice(firstUnpriced).every((p) => !(p > 0))).toBe(true);
  });
});
