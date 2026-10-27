import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/leads/store", () => ({ createLead: vi.fn() }));
vi.mock("@/lib/leads/notify", () => ({ notifyLead: vi.fn() }));

import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";
import { POST } from "@/app/api/shipping-inquiry/route";
import { normalizeShippingInquiry, validateShippingInquiry, US_STATES } from "@/lib/shipping/inquiry";

const createLeadMock = vi.mocked(createLead);
const notifyLeadMock = vi.mocked(notifyLead);

const valid = {
  name: "Jordan Rivera",
  email: "Jordan@Example.com",
  phone: "(555) 123-4567",
  vehicleOfInterest: "2022 Toyota Camry SE",
  deliveryZip: "30301",
  deliveryState: "GA",
  message: "Looking to buy next month.",
  consent: true,
};

let ipCounter = 0;
function request(body: unknown, ip = `203.0.113.${++ipCounter}`) {
  return new Request("http://localhost/api/shipping-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `${ip}, 10.0.0.1` },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  createLeadMock.mockReset();
  notifyLeadMock.mockReset();
  createLeadMock.mockResolvedValue({ id: "lead-1" } as Awaited<ReturnType<typeof createLead>>);
  notifyLeadMock.mockResolvedValue(true);
});

describe("shipping inquiry validation", () => {
  it("accepts a complete inquiry and normalizes it", () => {
    const inquiry = normalizeShippingInquiry({ ...valid, deliveryState: "ga", vehicleSlug: "2022-Toyota-Camry-SE" });
    expect(validateShippingInquiry(inquiry)).toEqual({});
    expect(inquiry.email).toBe("jordan@example.com");
    expect(inquiry.deliveryState).toBe("GA");
    expect(inquiry.vehicleSlug).toBe("2022-toyota-camry-se");
  });

  it("reports every missing required field", () => {
    const errors = validateShippingInquiry(normalizeShippingInquiry({}));
    expect(Object.keys(errors).sort()).toEqual(
      ["consent", "deliveryState", "deliveryZip", "email", "name", "phone", "vehicleOfInterest"].sort()
    );
  });

  it("rejects malformed email, phone, ZIP, and state", () => {
    const errors = validateShippingInquiry(
      normalizeShippingInquiry({ ...valid, email: "nope", phone: "12345", deliveryZip: "3030", deliveryState: "ZZ" })
    );
    expect(errors.email).toMatch(/valid email/);
    expect(errors.phone).toMatch(/10-digit/);
    expect(errors.deliveryZip).toMatch(/ZIP/);
    expect(errors.deliveryState).toMatch(/valid US state/);
  });

  it("accepts ZIP+4 and a leading US country code", () => {
    const inquiry = normalizeShippingInquiry({ ...valid, deliveryZip: "30301-1234", phone: "+1 555 123 4567" });
    expect(validateShippingInquiry(inquiry)).toEqual({});
  });

  it("requires explicit consent and drops unsafe vehicle slugs", () => {
    const inquiry = normalizeShippingInquiry({ ...valid, consent: false, vehicleSlug: "../../etc/passwd" });
    expect(validateShippingInquiry(inquiry).consent).toBeDefined();
    expect(inquiry.vehicleSlug).toBe("");
  });

  it("caps field lengths and strips control characters", () => {
    const inquiry = normalizeShippingInquiry({ ...valid, name: `A\u0000B${"x".repeat(500)}`, message: "line1\nline2\u0007" });
    expect(inquiry.name.length).toBe(100);
    expect(inquiry.name.startsWith("A B")).toBe(true);
    expect(inquiry.message).toBe("line1\nline2");
  });

  it("covers all 50 states plus DC", () => {
    expect(US_STATES).toHaveLength(51);
  });
});

describe("POST /api/shipping-inquiry", () => {
  it("stores and emails a valid inquiry with consent and lead-source details", async () => {
    const res = await POST(
      request({ ...valid, attribution: { utm_source: "google", utm_medium: "cpc", landing_page: "/" }, formPage: "/nationwide-car-shipping" })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, leadId: "lead-1" });
    expect(createLeadMock).toHaveBeenCalledTimes(1);
    const lead = createLeadMock.mock.calls[0][0];
    expect(lead).toMatchObject({ source: "shipping", name: "Jordan Rivera", email: "jordan@example.com" });
    expect(lead.payload).toMatchObject({
      deliveryZip: "30301",
      deliveryState: "GA",
      consentToContact: true,
      leadSource: { utmSource: "google", utmMedium: "cpc", landingPage: "/", formPage: "/nationwide-car-shipping" },
    });
    expect(notifyLeadMock).toHaveBeenCalledWith(expect.objectContaining({ source: "shipping" }));
  });

  it("associates the inquiry with the real listing when it starts from a vehicle page", async () => {
    const res = await POST(request({ ...valid, vehicleOfInterest: "edited by user", vehicleSlug: "2022-toyota-camry-se" }));
    expect(res.status).toBe(200);
    const payload = createLeadMock.mock.calls[0][0].payload!;
    expect(payload.vehicle).toMatchObject({
      slug: "2022-toyota-camry-se",
      title: "2022 Toyota Camry SE",
      stockNumber: "SM2201",
      url: "https://www.speedwaymotorsllc.com/inventory/2022-toyota-camry-se",
    });
    expect(payload.vehicleOfInterest).toBe("2022 Toyota Camry SE");
  });

  it("keeps the inquiry when the referenced vehicle has sold", async () => {
    await POST(request({ ...valid, vehicleSlug: "2015-sold-vehicle" }));
    const payload = createLeadMock.mock.calls[0][0].payload!;
    expect(payload.vehicle).toMatchObject({ slug: "2015-sold-vehicle", title: null });
    expect(payload.vehicleOfInterest).toBe("2022 Toyota Camry SE");
  });

  it("returns field errors for invalid input without storing anything", async () => {
    const res = await POST(request({ ...valid, email: "bad", consent: false }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.errors).sort()).toEqual(["consent", "email"]);
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without storing them", async () => {
    const res = await POST(request({ ...valid, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(createLeadMock).not.toHaveBeenCalled();
    expect(notifyLeadMock).not.toHaveBeenCalled();
  });

  it("rate limits repeated submissions from one IP", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await POST(request(valid, "198.51.100.77"))).status);
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses.slice(5)).toEqual([429, 429]);
  });

  it("still succeeds when the database write fails but the email is sent", async () => {
    createLeadMock.mockRejectedValueOnce(new Error("relation \"leads\" does not exist"));
    const res = await POST(request(valid));
    expect(res.status).toBe(200);
    expect(notifyLeadMock).toHaveBeenCalledTimes(1);
  });

  it("fails clearly when the lead can be neither stored nor emailed", async () => {
    createLeadMock.mockRejectedValueOnce(new Error("db down"));
    notifyLeadMock.mockResolvedValueOnce(false);
    const res = await POST(request(valid));
    expect(res.status).toBe(500);
    expect((await res.json()).message).toContain("(862) 264-2777");
  });

  it("rejects non-JSON bodies", async () => {
    const res = await POST(
      new Request("http://localhost/api/shipping-inquiry", { method: "POST", body: "not json", headers: { "x-forwarded-for": "192.0.2.9" } })
    );
    expect(res.status).toBe(400);
  });
});
