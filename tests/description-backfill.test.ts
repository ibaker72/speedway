import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { backfillDescriptions } from "@/lib/server/descriptionBackfill";
import type { DescriptionEnhancer } from "@/lib/descriptions/ai";
import { createSupabaseLikeDb, readMigration, SUPABASE_URL } from "./helpers/supabase-pglite";
import { INVENTORY_MIGRATIONS, inventoryPostgrest } from "./helpers/postgrest-shim";

const config = { url: SUPABASE_URL, key: "service-role-test-key" };
const LONG = "Spacious high-roof cargo van with a 159 inch wheelbase and plenty of room for tools, equipment, and inventory for contractors, delivery companies, and service businesses.";

let db: PGlite;

/** Rows shaped like production before this release (legacy importer output). */
async function seed() {
  const insert = `INSERT INTO public.inventory
    (slug, stock_number, vin, year, make, model, trim, body_type, price, mileage, exterior_color, interior_color,
     transmission, drivetrain, engine, fuel_type, features, description, raw_data, is_sold, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1000, $9, $10, $11, 'Automatic', $12, $13, $14, $15::text[], $16, $17::jsonb, $18, $19)`;
  const rows: unknown[][] = [
    // Blank feed DriveTrain → importer stored 'FWD'.
    ["jeep", "MZR174156", "1C4HJWDG3CL174156", 2012, "Jeep", "Wrangler Unlimited", "4WD 4dr Sport", "suv", 150215, "Dozer", "Black Interior", "FWD", "3.6 V6 Cylinder Engine", "gasoline",
      ["Four Wheel Drive", "Gasoline Fuel", "Bluetooth"], null,
      { vin: "1C4HJWDG3CL174156", transmission: "Automatic", fuelType: "gasoline", engine: "3.6 V6 Cylinder Engine", cylinders: 6, bodyType: "suv", exteriorColor: "Dozer", interiorColor: "Black Interior" }, false, "active"],
    // Slogan in Comments.
    ["odyssey", "MZR092425", "5FNRL3H43AB092425", 2010, "Honda", "Odyssey", "5dr EX", "van", 180000, "Silver", "Gray", "FWD", "3.5 V6 Cylinder Engine", "gasoline",
      ["Front Wheel Drive", "Gasoline Fuel"], "CASH DEAL ONLY !.",
      { vin: "5FNRL3H43AB092425", description: "CASH DEAL ONLY !.", transmission: "Automatic", fuelType: "gasoline", bodyType: "van" }, false, "active"],
    // Usable feed description.
    ["van", "MZR570219", "3C6LRVDG0ME570219", 2021, "Ram", "ProMaster Cargo Van", "2500 High Roof", "van", 96836, "White", "Black", "FWD", "3.6 V6 Cylinder Engine", "gasoline",
      ["Front Wheel Drive"], LONG, { vin: "3C6LRVDG0ME570219", description: LONG, drivetrain: "FWD", transmission: "Automatic", fuelType: "gasoline", bodyType: "van" }, false, "active"],
    // Edited by staff in Supabase (differs from the feed copy).
    ["civic", "S4", "2HGFE1E50RH473641", 2024, "Honda", "Civic", "Sport", "sedan", 12000, "Blue", "Black", "FWD", "2 4 Cylinder Engine", "gasoline",
      [], "Staff note: one of our favorites, come drive it.", { vin: "2HGFE1E50RH473641", description: LONG, drivetrain: "FWD", transmission: "Automatic", fuelType: "gasoline" }, false, "active"],
    // Sold: not shown, not processed by default.
    ["sold", "S5", "1FTBR1Y82SKB03927", 2025, "Ford", "Transit Cargo Van", null, "van", 9000, "White", "Gray", "RWD", null, "gasoline", [], null, { vin: "1FTBR1Y82SKB03927", drivetrain: "RWD" }, true, "inactive"],
  ];
  for (const r of rows) {
    await db.query(insert, r.map((v, i) => (i === 14 ? v : i === 16 ? JSON.stringify(v) : v)));
  }
}

async function get(vin: string) {
  return (await db.query<Record<string, unknown>>("SELECT * FROM public.inventory WHERE vin = $1", [vin])).rows[0];
}

beforeEach(async () => {
  db = await createSupabaseLikeDb();
  for (const file of INVENTORY_MIGRATIONS) await db.exec(readMigration(file));
  await seed();
  vi.stubGlobal("fetch", inventoryPostgrest(db));
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await db.close();
});

describe("description/spec backfill", () => {
  it("dry run reports changes and writes nothing", async () => {
    const before = await get("1C4HJWDG3CL174156");
    const summary = await backfillDescriptions(config, { apply: false });
    expect(summary).toMatchObject({ scanned: 4, changed: 4, written: 0, done: true });
    const jeepChange = summary.changes.find((c) => c.vin === "1C4HJWDG3CL174156");
    expect(jeepChange?.fields).toEqual(expect.arrayContaining(["drivetrain", "description", "specs"]));
    expect(await get("1C4HJWDG3CL174156")).toEqual(before);
  });

  it("applies corrections, generates missing descriptions, and preserves manual text", async () => {
    const summary = await backfillDescriptions(config, { apply: true });
    expect(summary).toMatchObject({ scanned: 4, written: 4, manualPreserved: 1, errors: [] });

    const jeep = await get("1C4HJWDG3CL174156");
    expect(jeep.drivetrain).toBe("4WD");
    expect(jeep.description_source).toBe("generated");
    expect(String(jeep.description)).toContain("four-wheel drive (4WD)");
    expect(jeep.interior_color).toBe("Black");

    const odyssey = await get("5FNRL3H43AB092425");
    expect(odyssey.description_source).toBe("generated");
    expect(odyssey.feed_description).toBe("CASH DEAL ONLY !.");

    const van = await get("3C6LRVDG0ME570219");
    expect(van).toMatchObject({ description_source: "feed", description: LONG });

    const civic = await get("2HGFE1E50RH473641");
    expect(civic).toMatchObject({ description_source: "manual", description: "Staff note: one of our favorites, come drive it." });

    // Sold rows are skipped unless asked for.
    expect((await get("1FTBR1Y82SKB03927")).description_source).toBeNull();
  });

  it("is idempotent: a second run writes nothing", async () => {
    await backfillDescriptions(config, { apply: true });
    const second = await backfillDescriptions(config, { apply: true });
    expect(second).toMatchObject({ scanned: 4, changed: 0, written: 0, unchanged: 4 });
  });

  it("is resumable from the reported cursor", async () => {
    const first = await backfillDescriptions(config, { apply: true, limit: 2, pageSize: 1 });
    expect(first).toMatchObject({ scanned: 2, done: false });
    const rest = await backfillDescriptions(config, { apply: true, afterId: first.lastId, pageSize: 1 });
    expect(rest).toMatchObject({ scanned: 2, done: true });
    const again = await backfillDescriptions(config, { apply: true });
    expect(again.changed).toBe(0);
  });

  it("does not overwrite a description someone typed after the backfill read the row", async () => {
    const shim = inventoryPostgrest(db);
    vi.stubGlobal("fetch", (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === "PATCH" && String(input).includes("description=is.null")) {
        await db.query("UPDATE public.inventory SET description = 'Typed just now' WHERE vin = '1C4HJWDG3CL174156'");
      }
      return shim(input, init);
    }) as typeof fetch);
    const summary = await backfillDescriptions(config, { apply: true });
    expect(summary.writeConflicts).toBe(1);
    expect((await get("1C4HJWDG3CL174156")).description).toBe("Typed just now");
  });

  it("stores an optional AI rewrite and reuses it on later runs", async () => {
    const enhance = vi.fn(async () => "AI rewrite: 2012 Jeep Wrangler Unlimited with 150,215 miles. Contact Speedway Motors in Paterson, NJ.");
    const enhancer: DescriptionEnhancer = {
      generator: "ai:claude-opus-5-5:template-v1",
      usage: { requests: 0, inputTokens: 0, outputTokens: 0, rejected: 0 },
      enhance: async (facts) => (facts.vin === "1C4HJWDG3CL174156" ? enhance() : null),
    };
    await backfillDescriptions(config, { apply: true, enhancer });
    const jeep = await get("1C4HJWDG3CL174156");
    expect(jeep).toMatchObject({ description_generator: "ai:claude-opus-5-5:template-v1" });
    expect(String(jeep.description)).toMatch(/^AI rewrite/);

    await backfillDescriptions(config, { apply: true, enhancer });
    expect(enhance).toHaveBeenCalledTimes(1);
    expect(String((await get("1C4HJWDG3CL174156")).description)).toMatch(/^AI rewrite/);
  });

  it("explains that the migration is required", async () => {
    await db.close();
    db = await createSupabaseLikeDb();
    for (const file of INVENTORY_MIGRATIONS.slice(0, -1)) await db.exec(readMigration(file));
    vi.stubGlobal("fetch", inventoryPostgrest(db));
    await expect(backfillDescriptions(config, { apply: false })).rejects.toThrow(/apply db\/migrations\/20261109/);
  });
});
