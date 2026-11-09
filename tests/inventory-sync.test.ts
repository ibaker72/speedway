import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { PGlite } from "@electric-sql/pglite";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { parseAutofundsCsv } from "@/lib/feed/autofunds-parser";
import { importVehicles } from "@/lib/server/importVehicles";
import { createSupabaseLikeDb, readMigration, SUPABASE_URL } from "./helpers/supabase-pglite";
import { INVENTORY_MIGRATIONS, inventoryPostgrest, type RequestLog } from "./helpers/postgrest-shim";

const HEADERS = [
  "DealerID", "StockNumber", "VIN", "Year", "Make", "Model", "Trim", "Condition", "InternetSpecial", "Mileage",
  "FuelType", "Transmission", "Body", "EngineDescription", "Cylinders", "ExteriorColor", "InteriorColor",
  "Comments", "PhotoUrls", "Options", "DriveTrain",
];

type Row = Partial<Record<(typeof HEADERS)[number], string>>;

const LONG_COMMENTS =
  "2021 Ram ProMaster 2500 High Roof with the 159 inch wheelbase. This cargo van has plenty of room for tools, " +
  "equipment, and inventory, and the high roof gives excellent interior working height for contractors and delivery work.";

const JEEP: Row = {
  StockNumber: "MZR174156", VIN: "1C4HJWDG3CL174156", Year: "2012", Make: "Jeep", Model: "Wrangler Unlimited",
  Trim: "4WD 4dr Sport", Condition: "Used", InternetSpecial: "8987", Mileage: "150215", FuelType: "Gasoline Fuel",
  Transmission: "Automatic", Body: "Sport Utility", EngineDescription: "3.6 V6 Cylinder Engine", Cylinders: "6",
  ExteriorColor: "Dozer", InteriorColor: "Black Interior", Comments: "", DriveTrain: "",
  PhotoUrls: "https://images.autofunds.net/a.jpg|https://images.autofunds.net/b.jpg",
  Options: "Four Wheel Drive|Gasoline Fuel|Bluetooth|Fog Lamps|Command-Trac shift-on-the-fly 4WD system",
};
const VAN: Row = {
  StockNumber: "MZR570219", VIN: "3C6LRVDG0ME570219", Year: "2021", Make: "Ram", Model: "ProMaster Cargo Van",
  Trim: "2500 High Roof", Condition: "Used", InternetSpecial: "31995", Mileage: "96836", FuelType: "Gasoline Fuel",
  Transmission: "Automatic", Body: "Cargo Van", EngineDescription: "3.6 V6 Cylinder Engine", Cylinders: "6",
  ExteriorColor: "White", InteriorColor: "Black", Comments: LONG_COMMENTS, DriveTrain: "FWD",
  PhotoUrls: "https://images.autofunds.net/c.jpg", Options: "Front Wheel Drive|Gasoline Fuel",
};
const ODYSSEY: Row = {
  StockNumber: "MZR092425", VIN: "5FNRL3H43AB092425", Year: "2010", Make: "Honda", Model: "Odyssey", Trim: "5dr EX",
  Condition: "Used", InternetSpecial: "6995", Mileage: "180000", FuelType: "Gasoline Fuel", Transmission: "Automatic",
  Body: "Mini-van, Passenger", EngineDescription: "3.5 V6 Cylinder Engine", Cylinders: "6", ExteriorColor: "Silver",
  InteriorColor: "Gray", Comments: "CASH DEAL ONLY !.", DriveTrain: "", PhotoUrls: "", Options: "Front Wheel Drive|Gasoline Fuel",
};

function csv(rows: Row[]): string {
  const quote = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [HEADERS.join(","), ...rows.map((r) => HEADERS.map((h) => quote(r[h] ?? "")).join(","))].join("\n");
}

function feed(...rows: Row[]) {
  return parseAutofundsCsv(csv(rows));
}

let db: PGlite;
let log: RequestLog[];

async function setup(migrations = INVENTORY_MIGRATIONS) {
  db = await createSupabaseLikeDb();
  for (const file of migrations) await db.exec(readMigration(file));
  log = [];
  vi.stubGlobal("fetch", inventoryPostgrest(db, log));
}

async function row(vin: string) {
  const result = await db.query<Record<string, unknown>>("SELECT * FROM public.inventory WHERE vin = $1", [vin]);
  return result.rows[0];
}

beforeEach(async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-test-key");
  vi.stubEnv("SYNC_ALLOW_MASS_INACTIVATION", "");
});

afterEach(async () => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  await db?.close();
});

describe("Autofunds sync", () => {
  it("imports the Jeep as 4WD and never invents defaults for blank specs", async () => {
    await setup();
    const summary = await importVehicles(feed(JEEP, VAN, ODYSSEY));
    expect(summary).toMatchObject({ inserted: 3, updated: 0, schemaMode: "full", errors: [] });

    const jeep = await row("1C4HJWDG3CL174156");
    expect(jeep.drivetrain).toBe("4WD");
    expect(jeep.engine).toBe("3.6L V6");
    expect(jeep.interior_color).toBe("Black");
    expect((jeep.specs as { sources: Record<string, string> }).sources.drivetrain).toBe("trim");
    // The raw CSV cells are preserved for auditing.
    expect((jeep.raw_data as { feed: Record<string, string> }).feed.Trim).toBe("4WD 4dr Sport");

    // Odyssey: blank DriveTrain, but Options say "Front Wheel Drive".
    expect((await row("5FNRL3H43AB092425")).drivetrain).toBe("FWD");
  });

  it("generates a description when the feed has none, and records provenance", async () => {
    await setup();
    await importVehicles(feed(JEEP));
    const jeep = await row("1C4HJWDG3CL174156");
    expect(jeep.description_source).toBe("generated");
    expect(jeep.description_generator).toBe("template-v1");
    expect(jeep.description).toBe(jeep.generated_description);
    expect(String(jeep.description)).toContain("2012 Jeep Wrangler Unlimited");
    expect(String(jeep.description)).toContain("150,215 miles");
    expect(String(jeep.description)).toContain("four-wheel drive (4WD)");
    expect(jeep.description_input_hash).toMatch(/^[0-9a-f]{32}$/);
    expect(jeep.description_generated_at).toBeTruthy();
  });

  it("imports usable Autofunds comments verbatim and keeps short notes alongside a generated description", async () => {
    await setup();
    await importVehicles(feed(VAN, ODYSSEY));
    const van = await row("3C6LRVDG0ME570219");
    expect(van.description_source).toBe("feed");
    expect(van.description).toBe(LONG_COMMENTS);
    expect(van.generated_description).toBeNull();

    const odyssey = await row("5FNRL3H43AB092425");
    expect(odyssey.description_source).toBe("generated");
    expect(odyssey.feed_description).toBe("CASH DEAL ONLY !.");
    expect(String(odyssey.description)).not.toContain("CASH DEAL");
  });

  it("is idempotent: an unchanged feed rewrites nothing except last_seen_at", async () => {
    await setup();
    await importVehicles(feed(JEEP, VAN, ODYSSEY));
    const before = await row("1C4HJWDG3CL174156");
    log.length = 0;

    const summary = await importVehicles(feed(JEEP, VAN, ODYSSEY));
    expect(summary).toMatchObject({ inserted: 0, updated: 0, unchanged: 3, markedInactive: 0, descriptionsGenerated: 0 });
    expect(log.filter((l) => l.method === "POST")).toHaveLength(0);
    expect(log.filter((l) => l.method === "PATCH")).toEqual([{ method: "PATCH", path: "/rest/v1/inventory", rows: 3 }]);

    const after = await row("1C4HJWDG3CL174156");
    for (const col of ["date_added", "date_modified", "description", "description_generated_at", "sync_hash"]) {
      expect(after[col]).toEqual(before[col]);
    }
    expect(new Date(after.last_seen_at as string).getTime()).toBeGreaterThanOrEqual(new Date(before.last_seen_at as string).getTime());
  });

  it("regenerates a description only when the facts change (mileage), not on a price change", async () => {
    await setup();
    await importVehicles(feed(JEEP));
    const first = await row("1C4HJWDG3CL174156");

    const priceOnly = await importVehicles(feed({ ...JEEP, InternetSpecial: "7995" }));
    expect(priceOnly).toMatchObject({ updated: 1, descriptionsGenerated: 0 });
    const second = await row("1C4HJWDG3CL174156");
    expect(Number(second.price)).toBe(7995);
    expect(second.description_generated_at).toEqual(first.description_generated_at);
    expect(second.date_added).toEqual(first.date_added);

    const mileage = await importVehicles(feed({ ...JEEP, InternetSpecial: "7995", Mileage: "151002" }));
    expect(mileage).toMatchObject({ updated: 1, descriptionsGenerated: 1 });
    const third = await row("1C4HJWDG3CL174156");
    expect(String(third.description)).toContain("151,002 miles");
    expect(third.description_input_hash).not.toEqual(first.description_input_hash);
  });

  it("never overwrites a description edited by staff", async () => {
    await setup();
    await importVehicles(feed(JEEP));
    const staffText = "Staff-written: freshly detailed and ready to see. Ask for Maria.";
    await db.query("UPDATE public.inventory SET description = $1 WHERE vin = $2", [staffText, "1C4HJWDG3CL174156"]);

    const summary = await importVehicles(feed({ ...JEEP, Mileage: "151002", Comments: LONG_COMMENTS }));
    expect(summary.manualDescriptionsPreserved).toBe(1);
    const jeep = await row("1C4HJWDG3CL174156");
    expect(jeep.description).toBe(staffText);
    expect(jeep.description_source).toBe("manual");
    expect(jeep.feed_description).toBe(LONG_COMMENTS);

    // Locked from now on, even though the hash now matches the manual text.
    await importVehicles(feed({ ...JEEP, Mileage: "152000" }));
    expect((await row("1C4HJWDG3CL174156")).description).toBe(staffText);
  });

  it("honors an explicit description_source = 'manual' lock", async () => {
    await setup();
    await importVehicles(feed(JEEP));
    await db.query("UPDATE public.inventory SET description_source = 'manual' WHERE vin = $1", ["1C4HJWDG3CL174156"]);
    const locked = (await row("1C4HJWDG3CL174156")).description;
    await importVehicles(feed({ ...JEEP, Mileage: "160000" }));
    expect((await row("1C4HJWDG3CL174156")).description).toBe(locked);
  });

  it("marks vehicles that left the feed inactive and reactivates them without resetting date_added", async () => {
    await setup();
    await importVehicles(feed(JEEP, VAN, ODYSSEY));
    const added = (await row("5FNRL3H43AB092425")).date_added;

    const gone = await importVehicles(feed(JEEP, VAN));
    expect(gone.markedInactive).toBe(1);
    expect(await row("5FNRL3H43AB092425")).toMatchObject({ is_sold: true, status: "inactive" });

    const back = await importVehicles(feed(JEEP, VAN, ODYSSEY));
    expect(back).toMatchObject({ updated: 1, unchanged: 2 });
    const odyssey = await row("5FNRL3H43AB092425");
    expect(odyssey).toMatchObject({ is_sold: false, status: "active" });
    expect(odyssey.date_added).toEqual(added);
  });

  it("refuses to mark most of the lot sold when the feed looks truncated", async () => {
    await setup();
    const many = Array.from({ length: 24 }, (_, i) => ({
      ...VAN,
      VIN: `3C6LRVDG0ME5702${String(i).padStart(2, "0")}`,
      StockNumber: `S${i}`,
    }));
    await importVehicles(feed(...many));
    const summary = await importVehicles(feed(many[0]));
    expect(summary.markedInactive).toBe(0);
    expect(summary.inactivationSkipped).toMatch(/23 of 24/);
    const active = await db.query("SELECT count(*)::int AS n FROM public.inventory WHERE NOT is_sold");
    expect((active.rows[0] as { n: number }).n).toBe(24);
  });

  it("keeps staff merchandising flags (is_featured) across syncs", async () => {
    await setup();
    await importVehicles(feed(JEEP));
    await db.query("UPDATE public.inventory SET is_featured = true WHERE vin = $1", ["1C4HJWDG3CL174156"]);
    await importVehicles(feed({ ...JEEP, InternetSpecial: "7000" }));
    expect((await row("1C4HJWDG3CL174156")).is_featured).toBe(true);
  });

  it("still syncs (legacy mode) when the description migration has not been applied yet", async () => {
    await setup(INVENTORY_MIGRATIONS.slice(0, -1));
    // The live table's spec columns are nullable (it drifted from the repo schema).
    await db.exec(`ALTER TABLE public.inventory
      ALTER COLUMN drivetrain DROP NOT NULL, ALTER COLUMN transmission DROP NOT NULL,
      ALTER COLUMN fuel_type DROP NOT NULL, ALTER COLUMN engine DROP NOT NULL,
      ALTER COLUMN exterior_color DROP NOT NULL, ALTER COLUMN interior_color DROP NOT NULL`);
    const first = await importVehicles(feed(JEEP, VAN));
    expect(first).toMatchObject({ schemaMode: "legacy", inserted: 2, errors: [] });
    const added = (await row("1C4HJWDG3CL174156")).date_added;
    expect((await row("1C4HJWDG3CL174156")).drivetrain).toBe("4WD");

    await importVehicles(feed(JEEP, VAN));
    expect((await row("1C4HJWDG3CL174156")).date_added).toEqual(added);
  });
});

describe("description/spec migration", () => {
  it("is idempotent and drops the invented spec defaults", async () => {
    await setup();
    await db.exec(readMigration("20261109_inventory_descriptions_and_specs.sql"));
    const defaults = await db.query<{ column_name: string; column_default: string | null; is_nullable: string }>(
      `SELECT column_name, column_default, is_nullable FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'inventory'
          AND column_name IN ('drivetrain', 'transmission', 'fuel_type', 'body_type')`
    );
    for (const col of defaults.rows) {
      expect(col.column_default).toBeNull();
      expect(col.is_nullable).toBe("YES");
    }
    await expect(
      db.exec("UPDATE public.inventory SET description_source = 'robot'")
    ).resolves.toBeDefined(); // no rows yet: constraint not exercised
    await db.exec(`INSERT INTO public.inventory (slug, stock_number, vin, year, make, model, body_type, price, mileage)
                   VALUES ('s', '1', 'V1', 2020, 'A', 'B', 'sedan', 1, 1)`);
    await expect(db.exec("UPDATE public.inventory SET description_source = 'robot'")).rejects.toThrow(/description_source_check/);
  });

  it("date_added repair restores the original value from created_at and is idempotent", async () => {
    await setup();
    await db.exec("ALTER TABLE public.inventory ADD COLUMN created_at timestamptz DEFAULT now()");
    await db.exec(`INSERT INTO public.inventory (slug, stock_number, vin, year, make, model, body_type, price, mileage, created_at, date_added)
                   VALUES ('s', '1', 'V1', 2020, 'A', 'B', 'sedan', 1, 1, '2026-06-02T00:00:00Z', '2026-11-09T07:00:00Z')`);
    await db.exec(readMigration("20261109b_inventory_restore_date_added.sql"));
    await db.exec(readMigration("20261109b_inventory_restore_date_added.sql"));
    const result = await db.query<{ date_added: Date }>("SELECT date_added FROM public.inventory");
    expect(result.rows[0].date_added.toISOString()).toBe("2026-06-02T00:00:00.000Z");
  });
});
