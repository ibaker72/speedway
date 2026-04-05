import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseUpsert } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerateCityPageRequest {
  city: string;
  state: string;
}

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
// OpenClaw helper
// ---------------------------------------------------------------------------

async function runOpenClawAgent(city: string, state: string): Promise<AgentPageResponse> {
  const apiKey = process.env.OPENCLAW_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENCLAW_API_KEY environment variable");
  }

  const prompt = [
    "You are an expert automotive SEO copywriter.",
    `Research the demographics for ${city}, ${state}.`,
    "Write an SEO-optimized landing page for Speedway Motors, a premium used car dealership.",
    "The copy must highlight our core inventory like Ford F-150s, Toyota Camrys, and SUVs,",
    `while blending in local geographic references for ${city}.`,
    "Return the data strictly as a JSON object containing: meta_title, h1_heading, and page_content_html.",
    "Do NOT wrap the JSON in markdown code fences. Return raw JSON only.",
  ].join(" ");

  const res = await fetch("https://api.openclaw.com/v1/agent/tasks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      response_format: "json",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenClaw API error ${res.status}: ${text}`);
  }

  const result = await res.json();

  // The agent may return the JSON inside a `content` or `output` field —
  // normalise to a parsed object either way.
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

    if (!city || !state) {
      return NextResponse.json(
        { message: "Both city and state are required" },
        { status: 400 }
      );
    }

    // 3. Generate content via OpenClaw agent
    const agentData = await runOpenClawAgent(city, state);

    // 4. Upsert into Supabase (city+state as natural composite key)
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
