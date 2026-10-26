import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

vi.mock("@/lib/leads/store", () => ({ createLead: vi.fn() }));
vi.mock("@/lib/leads/notify", () => ({ notifyLead: vi.fn() }));

import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";
import { POST as contactPost } from "@/app/api/contact/route";
import { POST as alertsPost } from "@/app/api/inventory-alerts/route";
import { cleanText, clientIp, isHoneypotTripped } from "@/lib/leads/guard";
import { submitLead } from "@/lib/leads/submit";
import { sanitizeEventParams } from "@/lib/analytics/track";
import { getInventory } from "@/lib/data/inventory-source";

const ROOT = path.resolve(__dirname, "..");
const createLeadMock = vi.mocked(createLead);
const notifyLeadMock = vi.mocked(notifyLead);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|json)$/.test(entry) ? [full] : [];
  });
}

describe("removed team profiles", () => {
  const REMOVED_NAMES = ["Ali Hassan", "Mike Rivera", "Sarah Chen", "Carlos Martinez"];

  it("no longer ships the team page", () => {
    expect(existsSync(path.join(ROOT, "app/team"))).toBe(false);
  });

  it("leaves no removed names in any rendered source, metadata, or structured data", () => {
    const files = ["app", "components", "lib"].flatMap((dir) => sourceFiles(path.join(ROOT, dir)));
    files.push(path.join(ROOT, "dealer.config.ts"));
    const hits = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      return REMOVED_NAMES.some((name) => text.includes(name));
    });
    expect(hits).toEqual([]);
  });

  it("removes every internal link to /team", () => {
    const files = ["app", "components", "lib"].flatMap((dir) => sourceFiles(path.join(ROOT, dir)));
    const hits = files.filter((file) => /href:\s*"\/team"|href="\/team"|"\/team"\s*\}/.test(readFileSync(file, "utf8")));
    expect(hits).toEqual([]);
  });
});

describe("lead input hardening", () => {
  it("trims, caps, and strips control characters", () => {
    expect(cleanText("  hi\u0000there  ", 100)).toBe("hi there");
    expect(cleanText("a".repeat(50), 10)).toHaveLength(10);
    expect(cleanText({ evil: true }, 10)).toBe("");
    expect(cleanText("a\nb", 10)).toBe("a b");
    expect(cleanText("a\nb", 10, { multiline: true })).toBe("a\nb");
  });

  it("reads the client IP from the first forwarded address", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" } });
    expect(clientIp(req)).toBe("203.0.113.5");
  });

  it("detects the honeypot field", () => {
    expect(isHoneypotTripped({ website: "" })).toBe(false);
    expect(isHoneypotTripped({ website: "spam.example" })).toBe(true);
  });
});

describe("lead delivery resilience", () => {
  beforeEach(() => {
    createLeadMock.mockReset();
    notifyLeadMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("emails the lead even when the database insert fails", async () => {
    createLeadMock.mockRejectedValue(new Error('relation "leads" does not exist'));
    notifyLeadMock.mockResolvedValue(true);
    const result = await submitLead({ source: "contact", name: "A", email: "a@b.co" });
    expect(result).toEqual({ ok: true, leadId: undefined, stored: false, notified: true });
  });

  it("fails only when neither storage nor email succeeds", async () => {
    createLeadMock.mockRejectedValue(new Error("down"));
    notifyLeadMock.mockResolvedValue(false);
    expect((await submitLead({ source: "contact" })).ok).toBe(false);
  });

  it("keeps the existing contact form working when storage is unavailable", async () => {
    createLeadMock.mockRejectedValue(new Error("down"));
    notifyLeadMock.mockResolvedValue(true);
    const res = await contactPost(
      new Request("http://x/api/contact", {
        method: "POST",
        headers: { "x-forwarded-for": "192.0.2.50" },
        body: JSON.stringify({ name: "Sam", email: "sam@example.com", message: "Hello" }),
      })
    );
    expect(res.status).toBe(200);
    expect(notifyLeadMock).toHaveBeenCalledWith(expect.objectContaining({ source: "contact", payload: { subject: "", message: "Hello" } }));
  });

  it("validates the existing contact form on the server", async () => {
    const res = await contactPost(
      new Request("http://x/api/contact", {
        method: "POST",
        headers: { "x-forwarded-for": "192.0.2.51" },
        body: JSON.stringify({ name: "Sam", email: "not-an-email", message: "Hello" }),
      })
    );
    expect(res.status).toBe(400);
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("does not let callers invent arbitrary lead sources", async () => {
    createLeadMock.mockResolvedValue({ id: "1" } as Awaited<ReturnType<typeof createLead>>);
    notifyLeadMock.mockResolvedValue(true);
    await alertsPost(
      new Request("http://x/api/inventory-alerts", {
        method: "POST",
        headers: { "x-forwarded-for": "192.0.2.52" },
        body: JSON.stringify({ email: "a@example.com", source: "admin-override" }),
      })
    );
    expect(createLeadMock.mock.calls[0][0].source).toBe("inventory-alert");
  });
});

describe("analytics privacy", () => {
  it("drops parameters that could carry personal or financial data", () => {
    expect(
      sanitizeEventParams({
        lead_type: "finance",
        page_path: "/finance",
        email: "a@b.co",
        customer_name: "Ana",
        phone: "555",
        delivery_zip: "30301",
        monthly_income: 5000,
      })
    ).toEqual({ lead_type: "finance", page_path: "/finance" });
  });
});

describe("inventory pagination past the last page", () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("treats PostgREST 416 as an empty page and keeps the real total", async () => {
    process.env.INVENTORY_SOURCE = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("offset=")) {
          return new Response(JSON.stringify({ code: "PGRST103" }), { status: 416, headers: { "content-range": "*/105" } });
        }
        return new Response(JSON.stringify([{ make: "Honda", model: "Civic", body_type: "sedan", price: 20000, year: 2020 }]), { status: 200 });
      })
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await getInventory({ page: 6, perPage: 24 });
    expect(result.vehicles).toEqual([]);
    expect(result.total).toBe(105);
    expect(result.totalPages).toBe(5);
    expect(result.filters.makes).toEqual([{ name: "Honda", count: 1 }]);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
