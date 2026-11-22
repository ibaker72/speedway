// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";
import { SUPABASE_URL, createSupabaseLikeDb, readMigration, runAs } from "./helpers/supabase-pglite";
import { inventoryPostgrest } from "./helpers/postgrest-shim";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { submitLead } from "@/lib/leads/submit";
import { MAX_NOTIFICATION_ATTEMPTS, deliverLeadNotification, processDueNotifications } from "@/lib/leads/notifications";
import { resetCircuitBreaker } from "@/lib/server/resilient-fetch";
import { POST as resendWebhook } from "@/app/api/webhooks/resend/route";

const LEADS_TABLE = readMigration("20261026_leads_table_rls.sql");
const MIGRATION = readMigration("20261122_lead_management_and_notifications.sql");

const accepted = (id = "msg_1") => ({ data: { id }, error: null });
const domainUnverified = { data: null, error: { name: "validation_error", statusCode: 403, message: "The speedwaymotorsllc.com domain is not verified. Please, add and verify your domain on https://resend.com/domains" } };
const networkFailure = { data: null, error: { name: "application_error", statusCode: null, message: "Unable to fetch data. The request could not be resolved." } };

const noSleep = { sleep: async () => {} };

async function freshDb(): Promise<PGlite> {
  const db = await createSupabaseLikeDb();
  await db.exec(LEADS_TABLE);
  await db.exec(MIGRATION);
  return db;
}

async function leadRow(db: PGlite, id: string) {
  return (await db.query<Record<string, unknown>>("SELECT * FROM public.leads WHERE id = $1", [id])).rows[0];
}
async function attempts(db: PGlite, id: string) {
  return (await db.query<Record<string, unknown>>("SELECT * FROM public.lead_notification_attempts WHERE lead_id = $1 ORDER BY attempt", [id])).rows;
}

const env = { ...process.env };
let db: PGlite;
let errors: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  resetCircuitBreaker();
  process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFICATION_EMAIL = "sales@example.com";
  sendMock.mockReset();
  db = await freshDb();
  vi.stubGlobal("fetch", inventoryPostgrest(db));
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  errors = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  process.env = { ...env };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const SAMPLE = { source: "finance", name: "Test Person", email: "person@example.com", phone: "(201) 555-0100", payload: { firstName: "Test", monthlyIncome: "4000" } };

describe("tracked lead notifications", () => {
  it("stores the lead before notifying and records the accepted attempt", async () => {
    sendMock.mockResolvedValue(accepted("msg_abc"));
    const result = await submitLead(SAMPLE);
    expect(result).toMatchObject({ ok: true, stored: true, notified: true, notification: "sent" });

    const row = await leadRow(db, result.leadId!);
    expect(row).toMatchObject({ status: "new", notification_status: "sent", notification_attempts: 1, notification_message_id: "msg_abc", notification_next_attempt_at: null });
    expect(row.notified_at).toBeTruthy();
    const [attempt] = await attempts(db, result.leadId!);
    expect(attempt).toMatchObject({ attempt: 1, trigger: "submit", outcome: "accepted", provider_message_id: "msg_abc", idempotency_key: `lead-notification/${result.leadId}/1` });
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][1]).toEqual({ idempotencyKey: `lead-notification/${result.leadId}/1` });
    expect(sendMock.mock.calls[0][0].text).toContain(`/admin/leads/${result.leadId}`);
  });

  it("keeps a lead whose email Resend rejects, queues a retry, and delivers it once email works", async () => {
    const t0 = new Date("2026-11-22T12:00:00Z");
    sendMock.mockResolvedValue(domainUnverified);
    vi.useFakeTimers({ now: t0, toFake: ["Date"] });
    const result = await submitLead(SAMPLE);
    vi.useRealTimers();

    expect(result).toMatchObject({ ok: true, stored: true, notified: false, notification: "queued" });
    let row = await leadRow(db, result.leadId!);
    expect(row.notification_status).toBe("pending");
    expect(row.notification_attempts).toBe(1);
    expect(String(row.notification_last_error)).toContain("validation_error (403)");
    expect(new Date(row.notification_next_attempt_at as string).getTime() - t0.getTime()).toBe(2 * 60_000);
    expect((await attempts(db, result.leadId!))[0]).toMatchObject({ outcome: "failed", error_code: "validation_error", ambiguous: false });

    // Not due yet: nothing is sent.
    expect((await processDueNotifications(25, { now: () => new Date(t0.getTime() + 60_000), ...noSleep })).due).toBe(0);

    // Domain verified; the retry job sends it, with a new key (the first request was definitively rejected).
    sendMock.mockResolvedValue(accepted("msg_ok"));
    const summary = await processDueNotifications(25, { now: () => new Date(t0.getTime() + 3 * 60_000), ...noSleep });
    expect(summary).toMatchObject({ due: 1, sent: 1 });
    row = await leadRow(db, result.leadId!);
    expect(row).toMatchObject({ notification_status: "sent", notification_attempts: 2, notification_last_error: null });
    expect(sendMock.mock.calls.at(-1)![1]).toEqual({ idempotencyKey: `lead-notification/${result.leadId}/2` });

    // Nothing left to do: no duplicate send.
    expect((await processDueNotifications(25, { now: () => new Date(t0.getTime() + 60 * 60_000), ...noSleep })).due).toBe(0);
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("reuses the idempotency key after an ambiguous failure so a repeat cannot send twice", async () => {
    sendMock.mockResolvedValue(networkFailure);
    const lead = await submitLeadWithoutSend();
    const first = await deliverLeadNotification(lead, "submit", noSleep);
    expect(first.status).toBe("pending");
    // One immediate retry inside the same attempt, same key.
    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock.mock.calls.map((c) => c[1].idempotencyKey)).toEqual([`lead-notification/${lead}/1`, `lead-notification/${lead}/1`]);
    expect((await attempts(db, lead))[0]).toMatchObject({ ambiguous: true });

    sendMock.mockResolvedValue(accepted());
    await processDueNotifications(25, { now: () => new Date(Date.now() + 3 * 60_000), ...noSleep });
    expect(sendMock.mock.calls.at(-1)![1]).toEqual({ idempotencyKey: `lead-notification/${lead}/1` });
  });

  it("stops after the last scheduled attempt, raises an alert, and never retries on its own again", async () => {
    sendMock.mockResolvedValue(domainUnverified);
    const lead = await submitLeadWithoutSend();
    let now = Date.now();
    await deliverLeadNotification(lead, "submit", { now: () => new Date(now), ...noSleep });
    for (let i = 0; i < 10; i++) {
      now += 13 * 60 * 60_000; // longer than the longest backoff
      await processDueNotifications(25, { now: () => new Date(now), ...noSleep });
    }
    const row = await leadRow(db, lead);
    expect(row).toMatchObject({ notification_status: "failed", notification_attempts: MAX_NOTIFICATION_ATTEMPTS, notification_next_attempt_at: null });
    expect(sendMock).toHaveBeenCalledTimes(MAX_NOTIFICATION_ATTEMPTS);
    expect(errors.mock.calls.flat().join(" ")).toContain("ALERT notification failed permanently");
    // The alert names the lead id, never the customer.
    expect(errors.mock.calls.flat().join(" ")).not.toContain("person@example.com");
  });

  it("lets only one of two concurrent workers send", async () => {
    sendMock.mockResolvedValue(accepted());
    const lead = await submitLeadWithoutSend();
    const later = { now: () => new Date(Date.now() + 5 * 60_000), ...noSleep };
    const outcomes = await Promise.all([deliverLeadNotification(lead, "retry", later), deliverLeadNotification(lead, "retry", later), deliverLeadNotification(lead, "manual", later)]);
    expect(outcomes.filter((o) => o.status === "sent")).toHaveLength(1);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("never starts a second attempt while one holds the lease, and recovers a crashed attempt with its own key", async () => {
    const lead = await submitLeadWithoutSend();
    const now = Date.now();
    await db.query(
      "UPDATE public.leads SET notification_status = 'sending', notification_attempts = 1, notification_next_attempt_at = $2 WHERE id = $1",
      [lead, new Date(now + 60_000).toISOString()]
    );
    sendMock.mockResolvedValue(accepted());
    expect(await deliverLeadNotification(lead, "manual", { now: () => new Date(now), ...noSleep })).toEqual({ status: "skipped", reason: "not_due" });
    expect(sendMock).not.toHaveBeenCalled();

    // Lease expired with no recorded outcome: repeat attempt 1's request.
    await processDueNotifications(25, { now: () => new Date(now + 2 * 60_000), ...noSleep });
    expect(sendMock.mock.calls[0][1]).toEqual({ idempotencyKey: `lead-notification/${lead}/1` });
    expect((await leadRow(db, lead)).notification_status).toBe("sent");
  });

  it("emails directly (untracked) when the database predates the tracking migration", async () => {
    const legacy = await createSupabaseLikeDb();
    await legacy.exec(LEADS_TABLE);
    vi.stubGlobal("fetch", inventoryPostgrest(legacy));
    sendMock.mockResolvedValue(accepted());
    const result = await submitLead(SAMPLE);
    expect(result).toMatchObject({ ok: true, stored: true, notified: true, notification: "sent" });
    expect((await legacy.query("SELECT count(*)::int AS n FROM public.leads")).rows[0]).toEqual({ n: 1 });
    expect(sendMock.mock.calls[0][1]).toBeUndefined();
  });

  it("does not store the lead twice when the insert is retried after a dropped connection", async () => {
    const real = inventoryPostgrest(db);
    let dropped = false;
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      const res = await real(input, init);
      if (!dropped && (init?.method ?? "GET") === "POST" && String(input).includes("/rest/v1/leads")) {
        dropped = true; // the row was written, but the response never arrived
        throw new TypeError("fetch failed", { cause: Object.assign(new Error("other side closed"), { code: "UND_ERR_SOCKET" }) });
      }
      return res;
    });
    sendMock.mockResolvedValue(accepted());
    const result = await submitLead(SAMPLE);
    expect(result.stored).toBe(true);
    expect((await db.query("SELECT count(*)::int AS n FROM public.leads")).rows[0]).toEqual({ n: 1 });
  });

  it("reports not-configured email as a failed attempt, not a success", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await submitLead(SAMPLE);
    expect(result).toMatchObject({ ok: true, stored: true, notified: false, notification: "queued" });
    expect((await attempts(db, result.leadId!))[0]).toMatchObject({ outcome: "failed", error_code: "not_configured" });
  });

  /** Stores a pending lead without attempting delivery (as if the request ended right after the insert). */
  async function submitLeadWithoutSend(): Promise<string> {
    const { createLead } = await import("@/lib/leads/store");
    return (await createLead(SAMPLE)).id;
  }
});

describe("lead tracking migration", () => {
  it("keeps existing leads, marks never-emailed ones failed without auto-retry, and is idempotent", async () => {
    const legacy = await createSupabaseLikeDb();
    await legacy.exec(LEADS_TABLE);
    await legacy.exec(`
      INSERT INTO public.leads (id, source, name, payload, created_at) VALUES ('0a745df5-de8e-43ff-9bd8-1bea393e7fd2', 'finance', 'Legacy', '{"monthlyIncome":"1"}', '2026-11-16T11:58:52Z');
      INSERT INTO public.leads (id, source, name, notified_at) VALUES ('11111111-1111-4111-8111-111111111111', 'contact', 'Emailed', now());`);
    await legacy.exec(MIGRATION);
    const shape = async () => (await legacy.query("SELECT id, name, payload, status, notification_status, notification_last_error IS NOT NULL AS has_note FROM public.leads ORDER BY id")).rows;
    const first = await shape();
    expect(first).toEqual([
      { id: "0a745df5-de8e-43ff-9bd8-1bea393e7fd2", name: "Legacy", payload: { monthlyIncome: "1" }, status: "new", notification_status: "failed", has_note: true },
      { id: "11111111-1111-4111-8111-111111111111", name: "Emailed", payload: {}, status: "new", notification_status: "sent", has_note: false },
    ]);
    await legacy.exec(MIGRATION);
    expect(await shape()).toEqual(first);

    vi.stubGlobal("fetch", inventoryPostgrest(legacy));
    expect((await processDueNotifications(25, { now: () => new Date("2027-01-01T00:00:00Z"), ...noSleep })).due).toBe(0);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("locks the new tables to the service role and enforces the status vocabulary", async () => {
    const fresh = await freshDb();
    for (const table of ["lead_notification_attempts", "lead_activity", "resend_webhook_events"]) {
      const meta = await fresh.query<{ rls: boolean; anon: number }>(
        `SELECT c.relrowsecurity AS rls, (SELECT count(*)::int FROM information_schema.role_table_grants WHERE table_name = $1 AND grantee IN ('anon','authenticated','PUBLIC')) AS anon
           FROM pg_class c WHERE c.oid = ('public.' || $1)::regclass`,
        [table]
      );
      expect(meta.rows[0]).toEqual({ rls: true, anon: 0 });
      expect((await runAs(fresh, "anon", `SELECT * FROM public.${table}`)).ok).toBe(false);
      expect((await runAs(fresh, "service_role", `SELECT * FROM public.${table}`)).ok).toBe(true);
    }
    await expect(fresh.exec(`INSERT INTO public.leads (source, status) VALUES ('contact', 'bogus')`)).rejects.toThrow(/leads_status_check/);
    await expect(fresh.exec(`INSERT INTO public.leads (source, notification_status) VALUES ('contact', 'maybe')`)).rejects.toThrow(/leads_notification_status_check/);
  });
});

describe("Resend delivery webhook", () => {
  const secretBytes = Buffer.from("test-webhook-signing-secret");
  const secret = `whsec_${secretBytes.toString("base64")}`;

  function signed(body: unknown, id = "msg_evt_1", timestamp = Math.floor(Date.now() / 1000)) {
    const raw = JSON.stringify(body);
    const signature = createHmac("sha256", secretBytes).update(`${id}.${timestamp}.${raw}`).digest("base64");
    return new Request("https://www.speedwaymotorsllc.com/api/webhooks/resend", {
      method: "POST",
      headers: { "svix-id": id, "svix-timestamp": String(timestamp), "svix-signature": `v1,${signature}` },
      body: raw,
    });
  }

  async function acceptedLead(messageId: string) {
    sendMock.mockResolvedValue(accepted(messageId));
    return (await submitLead(SAMPLE)).leadId!;
  }

  beforeEach(() => {
    process.env.RESEND_WEBHOOK_SECRET = secret;
  });

  it("records delivery, ignores duplicate events, and rejects bad signatures", async () => {
    const lead = await acceptedLead("msg_d1");
    const event = { type: "email.delivered", data: { email_id: "msg_d1" } };
    expect((await resendWebhook(signed(event, "evt_1"))).status).toBe(200);
    expect((await attempts(db, lead))[0]).toMatchObject({ delivery_status: "delivered" });

    const dup = await resendWebhook(signed(event, "evt_1"));
    expect(await dup.json()).toMatchObject({ duplicate: true });

    const forged = signed(event, "evt_2");
    forged.headers.set("svix-signature", "v1,AAAA");
    expect((await resendWebhook(forged)).status).toBe(401);
    expect((await resendWebhook(signed(event, "evt_3", Math.floor(Date.now() / 1000) - 3600))).status).toBe(401);
  });

  it("flags the lead when an accepted email bounces, and never moves delivery state backwards", async () => {
    const lead = await acceptedLead("msg_b1");
    await resendWebhook(signed({ type: "email.bounced", data: { email_id: "msg_b1" } }, "evt_b1"));
    expect(await leadRow(db, lead)).toMatchObject({ notification_status: "failed" });
    await resendWebhook(signed({ type: "email.sent", data: { email_id: "msg_b1" } }, "evt_b2"));
    expect((await attempts(db, lead))[0]).toMatchObject({ delivery_status: "bounced" });
  });

  it("is disabled until a signing secret is configured", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    expect((await resendWebhook(signed({ type: "email.delivered", data: {} }))).status).toBe(503);
  });
});
