// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import axe from "axe-core";
import type { PGlite } from "@electric-sql/pglite";
import { SUPABASE_URL, createSupabaseLikeDb, readMigration } from "./helpers/supabase-pglite";
import { inventoryPostgrest } from "./helpers/postgrest-shim";

const { cookieJar, sendMock, routerMock } = vi.hoisted(() => ({
  cookieJar: new Map<string, string>(),
  sendMock: vi.fn(),
  routerMock: { push: vi.fn(), refresh: vi.fn() },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)! } : undefined),
    set: (name: string, value: string) => void cookieJar.set(name, value),
    delete: (name: string) => void cookieJar.delete(name),
  }),
}));
vi.mock("next/navigation", async (importOriginal) => ({ ...(await importOriginal<typeof import("next/navigation")>()), useRouter: () => routerMock }));
vi.mock("resend", () => ({ Resend: class { emails = { send: sendMock }; } }));

import {
  COOKIE_NAME,
  adminPasswordMatches,
  createAdminSessionToken,
  isSameOriginRequest,
  safeAdminRedirect,
  verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { POST as login } from "@/app/api/admin/login/route";
import { PATCH as patchLead } from "@/app/api/admin/leads/[id]/route";
import { POST as postNote } from "@/app/api/admin/leads/[id]/notes/route";
import { POST as postNotify } from "@/app/api/admin/leads/[id]/notify/route";
import AdminLeadsPage from "@/app/admin/leads/page";
import AdminLeadDetailPage from "@/app/admin/leads/[id]/page";
import { matchesSearch } from "@/lib/leads/admin-store";
import { resetCircuitBreaker } from "@/lib/server/resilient-fetch";

const PASSWORD = "correct horse battery staple";
const SITE = "https://www.speedwaymotorsllc.com";
const FINANCE_ID = "0a745df5-de8e-43ff-9bd8-1bea393e7fd2";
const INQUIRY_ID = "0effb683-3210-4029-838b-101be63bf75c";

const env = { ...process.env };
let db: PGlite;

async function seed(db: PGlite) {
  await db.exec(readMigration("20261026_leads_table_rls.sql"));
  // Rows as they exist in production before the migration.
  await db.query(
    `INSERT INTO public.leads (id, source, name, email, phone, payload, created_at) VALUES
      ($1, 'finance', 'Pat Finance', 'pat@example.com', '(201) 555-0123', $2, '2026-11-16T11:58:52Z'),
      ($3, 'vehicle-inquiry', 'Sam Inquiry', 'sam@example.com', '201-555-0199', $4, '2026-11-10T14:33:04Z')`,
    [
      FINANCE_ID,
      JSON.stringify({ firstName: "Pat", lastName: "Finance", employer: "Acme Corp", jobTitle: "Welder", monthlyIncome: "4321", residenceStatus: "rent", downPayment: "2000", monthlyBudget: "450", vehicleType: "suv" }),
      INQUIRY_ID,
      JSON.stringify({
        inquiryType: "availability",
        inquiryLabel: "Check availability",
        vehicle: { id: "v1", title: "2012 Jeep Wrangler Unlimited 4WD 4dr Sport", vin: "1C4HJWDG3CL174156", stockNumber: "MZR174156", price: 8987, url: `${SITE}/inventory/2012-jeep-wrangler-unlimited-4wd-4dr-sport` },
        message: "Is it still available?",
        consentToContact: true,
        consentText: "I agree that Speedway Motors may contact me.",
        consentedAt: "2026-11-10T14:33:04Z",
        leadSource: { utmSource: "google", landingPage: "/inventory" },
      }),
    ]
  );
  await db.exec(readMigration("20261122_lead_management_and_notifications.sql"));
}

function adminRequest(url: string, init: RequestInit & { origin?: string | null } = {}) {
  const headers = new Headers(init.headers);
  headers.set("host", "www.speedwaymotorsllc.com");
  if (init.origin !== null) headers.set("origin", init.origin ?? SITE);
  headers.set("content-type", "application/json");
  return new Request(`${SITE}${url}`, { ...init, headers });
}
const ctx = (id: string) => ({ params: Promise.resolve({ id }) }) as never;

function signIn() {
  cookieJar.set(COOKIE_NAME, createAdminSessionToken());
}

beforeEach(async () => {
  resetCircuitBreaker();
  cookieJar.clear();
  sendMock.mockReset();
  process.env.DEAL_DESK_ADMIN_PASSWORD = PASSWORD;
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFICATION_EMAIL = "sales@example.com";
  db = await createSupabaseLikeDb();
  await seed(db);
  vi.stubGlobal("fetch", inventoryPostgrest(db));
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  process.env = { ...env };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("admin session", () => {
  it("issues signed, expiring tokens that never contain the password", () => {
    const token = createAdminSessionToken();
    expect(token).not.toContain(PASSWORD);
    expect(verifyAdminSessionToken(token)).toBe(true);
    expect(verifyAdminSessionToken(token, Date.now() + 9 * 60 * 60_000)).toBe(false); // expired
    const [v, exp, sig] = token.split(".");
    expect(verifyAdminSessionToken(`${v}.${Number(exp) + 3600}.${sig}`)).toBe(false); // extended expiry
    expect(verifyAdminSessionToken(PASSWORD)).toBe(false); // the old cookie format
    expect(verifyAdminSessionToken(undefined)).toBe(false);
  });

  it("compares passwords safely and only redirects to admin pages", () => {
    expect(adminPasswordMatches(PASSWORD)).toBe(true);
    expect(adminPasswordMatches("nope")).toBe(false);
    expect(safeAdminRedirect("/admin/deal-desk")).toBe("/admin/deal-desk");
    for (const bad of ["//evil.example", "https://evil.example/admin", "/admin/../api", "/admin/login", ["/admin"], undefined]) {
      expect(safeAdminRedirect(bad)).toBe("/admin/leads");
    }
  });

  it("rejects cross-site writes", () => {
    expect(isSameOriginRequest(adminRequest("/api/x"))).toBe(true);
    expect(isSameOriginRequest(adminRequest("/api/x", { origin: "https://evil.example" }))).toBe(false);
    const noOrigin = adminRequest("/api/x", { origin: null, headers: { "sec-fetch-site": "cross-site" } });
    expect(isSameOriginRequest(noOrigin)).toBe(false);
  });

  it("logs in with the password, stores a token (not the password), and rate-limits guessing", async () => {
    expect((await login(adminRequest("/api/admin/login", { method: "POST", body: JSON.stringify({ password: "wrong" }) }))).status).toBe(401);
    const ok = await login(adminRequest("/api/admin/login", { method: "POST", body: JSON.stringify({ password: PASSWORD }), headers: { "x-forwarded-for": "198.51.100.7" } }));
    expect(ok.status).toBe(200);
    expect(cookieJar.get(COOKIE_NAME)).not.toBe(PASSWORD);
    expect(verifyAdminSessionToken(cookieJar.get(COOKIE_NAME))).toBe(true);

    let last = 0;
    for (let i = 0; i < 11; i++) {
      last = (await login(adminRequest("/api/admin/login", { method: "POST", body: JSON.stringify({ password: "guess" }), headers: { "x-forwarded-for": "198.51.100.99" } }))).status;
    }
    expect(last).toBe(429);
  });
});

describe("admin lead API", () => {
  it("requires a signed-in session and a same-origin request", async () => {
    const body = JSON.stringify({ status: "contacted" });
    expect((await patchLead(adminRequest(`/api/admin/leads/${FINANCE_ID}`, { method: "PATCH", body }), ctx(FINANCE_ID))).status).toBe(401);
    cookieJar.set(COOKIE_NAME, PASSWORD); // the pre-upgrade cookie value no longer works
    expect((await patchLead(adminRequest(`/api/admin/leads/${FINANCE_ID}`, { method: "PATCH", body }), ctx(FINANCE_ID))).status).toBe(401);
    signIn();
    expect((await patchLead(adminRequest(`/api/admin/leads/${FINANCE_ID}`, { method: "PATCH", body, origin: "https://evil.example" }), ctx(FINANCE_ID))).status).toBe(403);
    expect((await db.query("SELECT status FROM public.leads WHERE id = $1", [FINANCE_ID])).rows[0]).toEqual({ status: "new" });
  });

  it("changes status with an audit entry and validates input", async () => {
    signIn();
    const res = await patchLead(adminRequest(`/api/admin/leads/${FINANCE_ID}`, { method: "PATCH", body: JSON.stringify({ status: "contacted", actor: "Dana" }) }), ctx(FINANCE_ID));
    expect(res.status).toBe(200);
    expect((await db.query("SELECT status, status_updated_at IS NOT NULL AS stamped FROM public.leads WHERE id = $1", [FINANCE_ID])).rows[0]).toEqual({ status: "contacted", stamped: true });
    expect((await db.query("SELECT kind, from_status, to_status, actor FROM public.lead_activity WHERE lead_id = $1", [FINANCE_ID])).rows).toEqual([
      { kind: "status_change", from_status: "new", to_status: "contacted", actor: "Dana" },
    ]);

    expect((await patchLead(adminRequest(`/api/admin/leads/${FINANCE_ID}`, { method: "PATCH", body: JSON.stringify({ status: "deleted" }) }), ctx(FINANCE_ID))).status).toBe(400);
    expect((await patchLead(adminRequest(`/api/admin/leads/not-a-uuid`, { method: "PATCH", body: JSON.stringify({ status: "sold" }) }), ctx("not-a-uuid"))).status).toBe(404);
    expect((await patchLead(adminRequest(`/api/admin/leads/${FINANCE_ID}`, { method: "PATCH", body: "[]" }), ctx(FINANCE_ID))).status).toBe(400);
  });

  it("saves notes and never deletes leads", async () => {
    signIn();
    expect((await postNote(adminRequest(`/api/admin/leads/${INQUIRY_ID}/notes`, { method: "POST", body: JSON.stringify({ note: "   " }) }), ctx(INQUIRY_ID))).status).toBe(400);
    const res = await postNote(adminRequest(`/api/admin/leads/${INQUIRY_ID}/notes`, { method: "POST", body: JSON.stringify({ note: "Left voicemail", actor: "" }) }), ctx(INQUIRY_ID));
    expect(res.status).toBe(201);
    expect((await db.query("SELECT kind, body, actor FROM public.lead_activity WHERE lead_id = $1", [INQUIRY_ID])).rows).toEqual([{ kind: "note", body: "Left voicemail", actor: "Staff" }]);
    expect((await db.query("SELECT count(*)::int AS n FROM public.leads")).rows[0]).toEqual({ n: 2 });
  });

  it("sends a missed lead's notification only when staff ask, once", async () => {
    signIn();
    sendMock.mockResolvedValue({ data: { id: "msg_manual" }, error: null });
    const res = await postNotify(adminRequest(`/api/admin/leads/${FINANCE_ID}/notify`, { method: "POST", body: JSON.stringify({ actor: "Dana" }) }), ctx(FINANCE_ID));
    expect(await res.json()).toEqual({ ok: true, notification: "sent" });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("sales@example.com"); // the sales inbox, never the customer
    const again = await postNotify(adminRequest(`/api/admin/leads/${FINANCE_ID}/notify`, { method: "POST", body: JSON.stringify({}) }), ctx(FINANCE_ID));
    expect(again.status).toBe(409);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });
});

describe("Website Leads dashboard", () => {
  async function renderPage(element: Promise<React.ReactElement>) {
    return render(await element);
  }

  it("redirects to the login page without a session", async () => {
    await expect(AdminLeadsPage({ searchParams: Promise.resolve({}) })).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_REDIRECT") });
    await expect(AdminLeadDetailPage({ params: Promise.resolve({ id: FINANCE_ID }) })).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_REDIRECT") });
  });

  it("lists every lead with vehicle and notification status, but no financing details", async () => {
    signIn();
    const { container } = await renderPage(AdminLeadsPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("link", { name: "Pat Finance" })).toHaveProperty("href", expect.stringContaining(`/admin/leads/${FINANCE_ID}`));
    expect(screen.getByText(/VIN 1C4HJWDG3CL174156/)).toBeTruthy();
    expect(screen.getAllByText("Email NOT sent")).toHaveLength(2);
    expect(screen.getByRole("alert").textContent).toContain("2 leads' sales email was not delivered");
    expect(container.textContent).not.toContain("4321");
    expect(container.textContent).not.toContain("Acme Corp");

    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });

  it("filters by status, type, notification failure and searches phone digits, VIN and stock number", async () => {
    signIn();
    await renderPage(AdminLeadsPage({ searchParams: Promise.resolve({ source: "finance" }) }));
    expect(screen.queryByText("Sam Inquiry")).toBeNull();
    cleanup();
    await renderPage(AdminLeadsPage({ searchParams: Promise.resolve({ q: "2015550199" }) }));
    expect(screen.getByText("Sam Inquiry")).toBeTruthy();
    expect(screen.queryByText("Pat Finance")).toBeNull();
    cleanup();
    await renderPage(AdminLeadsPage({ searchParams: Promise.resolve({ status: "sold" }) }));
    expect(screen.getByText("No leads match these filters.")).toBeTruthy();

    const item = { name: "Sam", email: "s@x.co", phone: "201-555-0199", vehicle: { vin: "1C4HJWDG3CL174156", stockNumber: "MZR174156" } };
    expect(matchesSearch(item, "mzr174156")).toBe(true);
    expect(matchesSearch(item, "CL174156")).toBe(true);
    expect(matchesSearch(item, "(201) 555")).toBe(true);
    expect(matchesSearch(item, "999")).toBe(false);
  });

  it("shows the full lead, financing details, consent and attribution on the detail page", async () => {
    signIn();
    const { container } = await renderPage(AdminLeadDetailPage({ params: Promise.resolve({ id: FINANCE_ID }) }));
    expect(screen.getByRole("heading", { name: "Financing details" })).toBeTruthy();
    expect(container.textContent).toContain("4321");
    expect(container.textContent).toContain("Acme Corp");
    expect(container.textContent).toContain("Not recorded (this form does not collect a consent checkbox)");
    expect(screen.getByRole("button", { name: "Send sales notification" })).toBeTruthy();
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    cleanup();

    const inquiry = await renderPage(AdminLeadDetailPage({ params: Promise.resolve({ id: INQUIRY_ID }) }));
    expect(screen.queryByRole("heading", { name: "Financing details" })).toBeNull();
    expect(inquiry.container.textContent).toContain("MZR174156");
    expect(inquiry.container.textContent).toContain("I agree that Speedway Motors may contact me.");
    expect(inquiry.container.textContent).toContain("google");
  });

  it("returns 404 for an unknown lead", async () => {
    signIn();
    await expect(AdminLeadDetailPage({ params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) })).rejects.toMatchObject({ digest: expect.stringContaining("NEXT_HTTP_ERROR_FALLBACK;404") });
  });
});
