import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseUpsert } from "@/lib/supabase";
import { dealerConfig } from "@/dealer.config";
import { getInventory } from "@/lib/data/inventory-source";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentPageResponse {
  meta_title: string;
  h1_heading: string;
  page_content_html: string;
}

interface GeoLandingPage extends AgentPageResponse {
  city: string;
  state: string;
}

// ---------------------------------------------------------------------------
// OpenClaw helper with retry
// ---------------------------------------------------------------------------

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  let lastError: Error = new Error("Unknown error");
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      // 429 or 5xx — retry; 4xx client errors are not retryable
      if (res.status < 500 && res.status !== 429) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000)); // 2s, 4s
    }
  }
  throw lastError;
}

async function runOpenClawAgent(city: string, state: string): Promise<AgentPageResponse> {
  const apiKey = process.env.OPENCLAW_API_KEY;
  if (!apiKey) throw new Error("Missing OPENCLAW_API_KEY environment variable");

  const apiBase = (process.env.OPENCLAW_API_BASE_URL ?? "https://api.openclaw.com/v1").replace(/\/$/, "");

  // Pull a snapshot of current inventory to give the agent real context
  const { vehicles, total } = await getInventory({ perPage: 12, sortBy: "date-added" });
  const inventorySnapshot = vehicles
    .slice(0, 8)
    .map((v) => `${v.year} ${v.make} ${v.model}${v.trim ? " " + v.trim : ""} — $${v.price.toLocaleString()}`)
    .join("; ");

  const featuredMakesList = [...new Set(vehicles.map((v) => v.make))].slice(0, 6).join(", ");
  const { stats } = dealerConfig;

  const prompt = [
    "You are an expert automotive SEO copywriter specializing in local search for used car dealerships.",
    `Write a complete SEO-optimized landing page for Speedway Motors LLC, a used car dealership serving customers from ${city}, ${state}.`,
    "",
    "DEALER CONTEXT:",
    `- Name: Speedway Motors LLC`,
    `- Location: 302-304 22nd Ave, Paterson, NJ 07513 (${city} is a nearby market)`,
    `- Established: 2005 (${stats.yearsInBusiness} years in business)`,
    `- Google Rating: ${stats.googleRating}/5 from ${stats.totalReviews}+ reviews`,
    `- Total inventory: ${total}+ quality pre-owned vehicles`,
    `- Available makes include: ${featuredMakesList}`,
    `- Sample current inventory: ${inventorySnapshot}`,
    `- Financing: available for all credit levels including bad credit and first-time buyers`,
    `- Services: used car sales, auto financing, vehicle trade-ins, commercial vehicle sales`,
    "",
    "CONTENT REQUIREMENTS:",
    "1. The page must target buyers searching from " + city + ", " + state + " who are willing to drive to Paterson, NJ.",
    "2. Naturally weave in geographic references to " + city + " and its surrounding neighborhoods.",
    "3. Include at least one paragraph on financing options (mention bad credit / no credit welcome).",
    "4. Include at least one paragraph on trade-in value.",
    "5. Reference real makes/models from the inventory snapshot above to show live availability.",
    "6. Include an internal link anchor tag to the inventory page: <a href=\"/inventory\">browse our full inventory</a>.",
    "7. Include an internal link to the financing page: <a href=\"/finance\">apply for financing</a>.",
    "8. Structure the HTML content with H2 and H3 subheadings (never H1 — that is provided separately).",
    "9. Aim for 400–600 words of body content.",
    "10. Do NOT include a CTA button or form — the page template handles those.",
    "",
    "OUTPUT FORMAT:",
    "Return ONLY a raw JSON object (no markdown fences) with exactly these three keys:",
    "  meta_title   — 55–60 characters, includes city name and primary keyword",
    "  h1_heading   — 60–80 characters, compelling H1 for the page",
    "  page_content_html — the full HTML body content as a string",
  ].join("\n");

  const res = await fetchWithRetry(
    `${apiBase}/agent/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, response_format: "json" }),
    },
    3
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenClaw API error ${res.status}: ${text}`);
  }

  const result = await res.json();

  // Normalize: agent may return JSON inside `content`, `output`, or at root
  const raw: unknown = result.output ?? result.content ?? result;
  const parsed: AgentPageResponse =
    typeof raw === "string" ? JSON.parse(raw) : (raw as AgentPageResponse);

  if (!parsed.meta_title || !parsed.h1_heading || !parsed.page_content_html) {
    throw new Error(
      "OpenClaw response missing required fields (meta_title, h1_heading, page_content_html)"
    );
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 1. Admin-only access
    const authed = await isAdminAuthenticated();
    if (!authed) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse & validate input
    const body = (await request.json()) as Record<string, unknown>;
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const dryRun = body.dry_run === true;

    if (!city || !state) {
      return NextResponse.json(
        { message: "Both city and state are required" },
        { status: 400 }
      );
    }

    // 3. Generate content via OpenClaw agent
    const agentData = await runOpenClawAgent(city, state);

    // 4. Dry run — return preview without saving
    if (dryRun) {
      return NextResponse.json({ ok: true, dry_run: true, preview: agentData });
    }

    // 5. Upsert into Supabase (city+state as natural composite key)
    const row: Record<string, unknown> = {
      city,
      state,
      meta_title: agentData.meta_title,
      h1_heading: agentData.h1_heading,
      page_content_html: agentData.page_content_html,
    };

    const { data, error } = await supabaseUpsert<GeoLandingPage>(
      "geo_landing_pages",
      [row],
      "city,state"
    );

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json({ message: "Failed to save landing page", detail: error }, { status: 500 });
    }

    // 6. Invalidate ISR cache for the affected location page(s)
    //    Slug is derived by converting "Jersey City" → "jersey-city-nj"
    const citySlug = city.toLowerCase().replace(/\s+/g, "-");
    const stateAbbr = state.length === 2 ? state.toLowerCase() : state.slice(0, 2).toLowerCase();
    revalidatePath(`/locations/${citySlug}-${stateAbbr}`);
    revalidatePath("/locations");

    return NextResponse.json({
      ok: true,
      page: data?.[0] ?? row,
    });
  } catch (err) {
    console.error("generate-city-page error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
