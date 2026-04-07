import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { geoLocations } from "@/lib/geo/locations";

// ---------------------------------------------------------------------------
// Bulk geo page generation — calls /api/generate-city-page for each location
// with a staggered delay to avoid rate-limiting the OpenClaw API.
//
// POST /api/admin/generate-all-geo-pages
// Body (optional): { slugs: ["newark-nj", "clifton-nj"] }  — subset of slugs
//                  { dry_run: true }  — preview only, nothing saved
// ---------------------------------------------------------------------------

const STAGGER_MS = 2500; // delay between OpenClaw calls

interface GenerateResult {
  slug: string;
  city: string;
  state: string;
  status: "ok" | "error" | "skipped";
  error?: string;
}

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const dryRun = body.dry_run === true;
    const slugFilter = Array.isArray(body.slugs) ? new Set(body.slugs as string[]) : null;

    const targets = slugFilter
      ? geoLocations.filter((loc) => slugFilter.has(loc.slug))
      : geoLocations;

    if (targets.length === 0) {
      return NextResponse.json({ message: "No matching geo locations found" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsllc.com";
    const results: GenerateResult[] = [];

    for (let i = 0; i < targets.length; i++) {
      const loc = targets[i];

      // Stagger requests after the first one
      if (i > 0) {
        await new Promise((r) => setTimeout(r, STAGGER_MS));
      }

      try {
        const res = await fetch(`${baseUrl}/api/generate-city-page`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: loc.city, state: loc.state, dry_run: dryRun }),
        });

        if (res.ok) {
          results.push({ slug: loc.slug, city: loc.city, state: loc.state, status: "ok" });
        } else {
          const data = (await res.json().catch(() => ({}))) as { message?: string };
          results.push({
            slug: loc.slug,
            city: loc.city,
            state: loc.state,
            status: "error",
            error: data.message || `HTTP ${res.status}`,
          });
        }
      } catch (err) {
        results.push({
          slug: loc.slug,
          city: loc.city,
          state: loc.state,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Revalidate the locations index after bulk generation
    if (!dryRun) {
      revalidatePath("/locations");
    }

    const succeeded = results.filter((r) => r.status === "ok").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      ok: true,
      dry_run: dryRun,
      summary: { total: targets.length, succeeded, failed },
      results,
    });
  } catch (err) {
    console.error("generate-all-geo-pages error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
