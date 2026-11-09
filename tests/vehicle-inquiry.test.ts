import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/leads/store", () => ({ createLead: vi.fn() }));
vi.mock("@/lib/leads/notify", () => ({ notifyLead: vi.fn() }));

import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";
import { POST } from "@/app/api/vehicle-inquiry/route";
import { POST as shippingPOST } from "@/app/api/shipping-inquiry/route";
import { allVehicles } from "@/lib/data/vehicles-full";
import { hasTooManyLinks, normalizeVehicleInquiry, validateVehicleInquiry } from "@/lib/leads/vehicle-inquiry";

const createLeadMock = vi.mocked(createLead);
const notifyLeadMock = vi.mocked(notifyLead);
const camry = allVehicles.find((v) => v.slug === "2022-toyota-camry-se")!;

const valid = {
  inquiryType: "availability",
  vehicleSlug: camry.slug,
  name: "Jordan Rivera",
  email: "Jordan@Example.com",
  phone: "(555) 123-4567",
  preferredContact: "phone",
  message: "Can I see it Saturday?",
  consent: true,
  website: "",
  formPage: "/inventory/2022-toyota-camry-se",
  attribution: { utm_source: "google", utm_medium: "cpc", utm_campaign: "used-suv", utm_term: "used camry", gclid: "Cj0KCQ", landing_page: "/inventory" },
};

let ip = 0;
function request(body: unknown, address = `198.51.100.${++ip}`, url = "http://localhost/api/vehicle-inquiry") {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": address },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  createLeadMock.mockReset();
  notifyLeadMock.mockReset();
  createLeadMock.mockResolvedValue({ id: "lead-1" } as Awaited<ReturnType<typeof createLead>>);
  notifyLeadMock.mockResolvedValue(true);
});

describe("POST /api/vehicle-inquiry", () => {
  it("stores the vehicle (resolved on the server), inquiry type, contact, consent, timestamp, and attribution", async () => {
    const res = await POST(request({ ...valid, vin: "SPOOFED-VIN", stockNumber: "SPOOFED" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, leadId: "lead-1" });

    const lead = createLeadMock.mock.calls[0][0];
    expect(lead).toMatchObject({ source: "vehicle-inquiry", name: "Jordan Rivera", email: "jordan@example.com", phone: "(555) 123-4567" });
    expect(lead.payload).toMatchObject({
      inquiryType: "availability",
      inquiryLabel: "Check availability",
      vehicleOfInterest: "2022 Toyota Camry SE",
      vehicle: {
        id: camry.id,
        slug: camry.slug,
        vin: camry.vin,
        stockNumber: camry.stockNumber,
        price: camry.price,
        url: "https://www.speedwaymotorsllc.com/inventory/2022-toyota-camry-se",
      },
      message: "Can I see it Saturday?",
      preferredContact: "phone",
      consentToContact: true,
      consentText: expect.stringContaining("Consent is not a condition of purchase"),
      leadSource: {
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "used-suv",
        utmTerm: "used camry",
        gclid: "Cj0KCQ",
        landingPage: "/inventory",
        formPage: "/inventory/2022-toyota-camry-se",
      },
    });
    expect(new Date(String(lead.payload!.submittedAt)).toISOString()).toBe(lead.payload!.submittedAt);
    expect(notifyLeadMock).toHaveBeenCalledOnce();
  });

  it("rejects invalid submissions with field errors and stores nothing", async () => {
    for (const [patch, field] of [
      [{ name: "" }, "name"],
      [{ email: "not-an-email" }, "email"],
      [{ phone: "123" }, "phone"],
      [{ phone: "", preferredContact: "phone" }, "phone"],
      [{ consent: false }, "consent"],
      [{ inquiryType: "loan-approval" }, "inquiryType"],
      [{ vehicleSlug: "../../etc" }, "vehicleSlug"],
      [{ inquiryType: "question", message: "" }, "message"],
    ] as const) {
      const res = await POST(request({ ...valid, ...patch }));
      expect(res.status, JSON.stringify(patch)).toBe(400);
      expect((await res.json()).errors).toHaveProperty(field);
    }
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions", async () => {
    const res = await POST(request({ ...valid, website: "https://spam.example" }));
    expect(res.status).toBe(200);
    expect(createLeadMock).not.toHaveBeenCalled();
  });

  it("rejects link-stuffed messages", async () => {
    const res = await POST(request({ ...valid, message: "Buy now https://a.example https://b.example" }));
    expect(res.status).toBe(400);
    expect((await res.json()).errors.message).toMatch(/links/);
  });

  it("rate-limits repeated submissions from one address", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await POST(request(valid, "203.0.113.250"))).status);
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses.slice(5)).toEqual([429, 429]);
  });

  it("still records the inquiry when the listing has just sold", async () => {
    const res = await POST(request({ ...valid, vehicleSlug: "2019-sold-vehicle" }));
    expect(res.status).toBe(200);
    expect(createLeadMock.mock.calls[0][0].payload!.vehicle).toEqual({
      slug: "2019-sold-vehicle",
      title: null,
      note: "Listing not found (it may have sold)",
    });
  });

  it("returns an error the customer can act on when neither storage nor email works", async () => {
    createLeadMock.mockRejectedValue(new Error("db down"));
    notifyLeadMock.mockResolvedValue(false);
    const res = await POST(request(valid));
    expect(res.status).toBe(500);
    expect((await res.json()).message).toMatch(/call us/i);
  });
});

describe("shipping quote leads", () => {
  it("attach the server-resolved vehicle ID, VIN and stock number plus a submission timestamp", async () => {
    const res = await shippingPOST(
      request(
        { name: "Jordan Rivera", email: "j@example.com", phone: "5551234567", vehicleOfInterest: "x", vehicleSlug: camry.slug, deliveryZip: "30301", deliveryState: "GA", consent: true, attribution: { gclid: "g1" } },
        "198.51.100.200",
        "http://localhost/api/shipping-inquiry"
      )
    );
    expect(res.status).toBe(200);
    const payload = createLeadMock.mock.calls[0][0].payload!;
    expect(payload.vehicle).toMatchObject({ id: camry.id, vin: camry.vin, stockNumber: camry.stockNumber });
    expect(payload).toMatchObject({ deliveryZip: "30301", deliveryState: "GA", leadSource: { gclid: "g1" } });
    expect(typeof payload.submittedAt).toBe("string");
  });
});

describe("vehicle inquiry validation helpers", () => {
  it("normalizes untrusted input", () => {
    const inquiry = normalizeVehicleInquiry({ inquiryType: "question", name: "  Ann \u0007 ", email: " ANN@EX.COM ", vehicleSlug: "ABC-123", consent: "on" });
    expect(inquiry).toMatchObject({ inquiryType: "question", name: "Ann", email: "ann@ex.com", vehicleSlug: "abc-123", consent: true, preferredContact: "email" });
    expect(validateVehicleInquiry(inquiry)).toEqual({ message: "Please type your question." });
  });

  it("allows one link but not several", () => {
    expect(hasTooManyLinks("see https://example.com")).toBe(false);
    expect(hasTooManyLinks("https://a.com and www.b.com")).toBe(true);
  });
});
