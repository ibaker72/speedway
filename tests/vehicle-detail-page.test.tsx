// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { render, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import axe from "axe-core";
import type { Vehicle } from "@/lib/types/vehicle";

vi.mock("@/lib/data/inventory-source", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/inventory-source")>();
  return { ...actual, getVehicleBySlug: vi.fn(actual.getVehicleBySlug) };
});

import * as inventory from "@/lib/data/inventory-source";
import VehicleDetailPage, { generateMetadata } from "@/app/inventory/[slug]/page";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";

const getVehicleBySlug = vi.mocked(inventory.getVehicleBySlug);

function okFetch() {
  return vi.fn().mockImplementation(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
}

/** Calls to one endpoint (the deal-builder module also pings /api/deal-desk/track on mount). */
function callsTo(fetchMock: ReturnType<typeof okFetch>, endpoint: string) {
  return fetchMock.mock.calls.filter(([url]) => url === endpoint) as [string, RequestInit][];
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
});

beforeEach(() => {
  vi.stubGlobal("fetch", okFetch());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  getVehicleBySlug.mockClear();
});

async function renderPage(slug: string) {
  const element = await VehicleDetailPage({ params: Promise.resolve({ slug }) });
  return render(element);
}

/** The 2012 Wrangler as production stores it before the backfill: blank feed drivetrain, no description. */
const WRANGLER: Vehicle = {
  id: "w1",
  slug: "2012-jeep-wrangler-unlimited-4wd-4dr-sport",
  stockNumber: "MZR174156",
  vin: "1C4HJWDG3CL174156",
  year: 2012,
  make: "Jeep",
  model: "Wrangler Unlimited",
  trim: "4WD 4dr Sport",
  condition: "used",
  price: 8987,
  mileage: 150215,
  exteriorColor: "Dozer",
  interiorColor: "Black Interior",
  transmission: "Automatic",
  engine: "3.6 V6 Cylinder Engine",
  cylinders: 6,
  fuelType: "Gasoline",
  bodyType: "suv",
  images: [
    { url: "https://images.autofunds.net/a.jpg", alt: "", isPrimary: true },
    { url: "https://images.autofunds.net/b.jpg", alt: "", isPrimary: false },
  ],
  features: ["Four Wheel Drive", "Gasoline Fuel", "6-speed manual transmission", "Fog Lamps", "Bluetooth"],
  isCommercial: false,
  isFeatured: false,
  isNewArrival: false,
  isSold: false,
  dateAdded: "2026-06-02",
};

function sectionOrder(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[data-section]")].map((el) => el.getAttribute("data-section")!);
}

describe("vehicle detail page layout", () => {
  it("renders sections in the mobile reading order: breadcrumb, title, gallery, price/specs, actions, overview, specs, financing/shipping, related", async () => {
    const { container } = await renderPage("2022-toyota-camry-se");
    const order = sectionOrder(container).filter((s) =>
      ["breadcrumb", "title", "gallery", "price", "key-specs", "actions", "overview", "specs", "finance-shipping", "related"].includes(s)
    );
    expect(order).toEqual(["breadcrumb", "title", "gallery", "price", "key-specs", "actions", "overview", "specs", "finance-shipping", "related"]);
  });

  it("shows the title, price, key specs, and all five actions near the top", async () => {
    await renderPage("2022-toyota-camry-se");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("2022 Toyota CamrySE");
    const summary = screen.getByRole("complementary", { name: "Price and contact options" });
    expect(within(summary).getByText("$24,995")).toBeTruthy();
    expect(within(summary).getByText("28,450 miles")).toBeTruthy();
    expect(within(summary).getByRole("button", { name: "Check Availability" })).toBeTruthy();
    expect(within(summary).getByRole("link", { name: /Call dealership/ }).getAttribute("href")).toMatch(/^tel:/);
    expect(within(summary).getByRole("button", { name: "Ask a Question" })).toBeTruthy();
    expect(within(summary).getByRole("button", { name: "Get Financing Information" })).toBeTruthy();
    expect(within(summary).getByRole("button", { name: "Request Shipping Quote" })).toBeTruthy();
  });

  it("never shows 'No description available' — a missing description is generated from verified data", async () => {
    getVehicleBySlug.mockResolvedValueOnce(WRANGLER);
    const { container } = await renderPage(WRANGLER.slug);
    expect(container.textContent).not.toMatch(/no description available/i);
    const overview = screen.getByRole("region", { name: "Vehicle Overview" });
    expect(overview.textContent).toContain("2012 Jeep Wrangler Unlimited 4WD 4dr Sport");
    expect(overview.textContent).toContain("four-wheel drive (4WD)");
  });

  it("shows the Wrangler as 4WD and omits the contradictory transmission instead of guessing", async () => {
    getVehicleBySlug.mockResolvedValueOnce(WRANGLER);
    await renderPage(WRANGLER.slug);
    const specs = screen.getByRole("region", { name: "Features & Specifications" });
    const terms = within(specs).getAllByRole("term").map((t) => t.textContent);
    const definitions = within(specs).getAllByRole("definition").map((d) => d.textContent);
    expect(definitions).toContain("Four-wheel drive (4WD)");
    expect(definitions).not.toContain("Front-wheel drive (FWD)");
    expect(terms).not.toContain("Transmission");
    expect(definitions).toContain("Black"); // "Black Interior" cleaned
    expect(definitions).toContain("3.6L V6");
  });

  it("omits missing specification fields everywhere instead of showing defaults", async () => {
    getVehicleBySlug.mockResolvedValueOnce({ ...WRANGLER, trim: "Sport", features: [], drivetrain: undefined, engine: undefined, exteriorColor: undefined });
    const { container } = await renderPage(WRANGLER.slug);
    const keySpecs = container.querySelector("[data-section='key-specs']")!;
    expect(keySpecs.textContent).not.toMatch(/FWD|Drivetrain|Engine|Exterior/);
    expect(container.textContent).not.toContain("FWD");
  });

  it("shows a short dealer comment as a note next to a generated overview", async () => {
    getVehicleBySlug.mockResolvedValueOnce({ ...WRANGLER, description: "CASH DEAL ONLY !." });
    await renderPage(WRANGLER.slug);
    const overview = screen.getByRole("region", { name: "Vehicle Overview" });
    expect(overview.textContent).toContain("Dealer note: CASH DEAL ONLY !.");
    expect(overview.textContent).toContain("150,215 miles");
  });

  it("returns a 404 (notFound) for sold or removed vehicles and noindexes them", async () => {
    getVehicleBySlug.mockResolvedValue(null);
    await expect(VehicleDetailPage({ params: Promise.resolve({ slug: "sold-car" }) })).rejects.toMatchObject({
      digest: expect.stringContaining("404"),
    });
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "sold-car" }) });
    expect(meta.robots).toEqual({ index: false, follow: true });
    getVehicleBySlug.mockReset();
    getVehicleBySlug.mockImplementation((await vi.importActual<typeof import("@/lib/data/inventory-source")>("@/lib/data/inventory-source")).getVehicleBySlug);
  });

  it("links related vehicles and the make/body-style pages", async () => {
    await renderPage("2022-toyota-camry-se");
    const related = screen.getByRole("region", { name: "Similar Vehicles" });
    const links = within(related).getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links.some((href) => href?.startsWith("/inventory/") && !href.includes("2022-toyota-camry-se"))).toBe(true);
    expect(links).toContain("/inventory?type=sedan");
  });

  it("still links similar inventory for a one-of-a-kind make whose body style is unknown", async () => {
    // Production: the only Porsche (Cayenne Coupe) and only Mercedes (CLA) have a
    // body-style conflict, so neither the make nor the body query finds anything.
    getVehicleBySlug.mockResolvedValueOnce({ ...WRANGLER, id: "solo", slug: "2022-lotus-emira-first-edition", make: "Lotus", model: "Emira", trim: "First Edition", bodyType: undefined });
    await renderPage("2022-lotus-emira-first-edition");
    const related = screen.getByRole("region", { name: "Similar Vehicles" });
    const vehicleLinks = within(related)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"))
      .filter((href) => /^\/inventory\/\d{4}-/.test(href ?? ""));
    expect(vehicleLinks.length).toBeGreaterThan(0);
    expect(vehicleLinks).not.toContain("/inventory/2022-lotus-emira-first-edition");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = await renderPage("2022-toyota-camry-se");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    const results = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
    expect(results.violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
  });
});

describe("vehicle detail lead actions", () => {
  function fill(container: HTMLElement, label: RegExp, value: string) {
    // "Email"/"Phone" also label the contact-preference radios, so target the text field.
    const field = ["^Email", "^Phone"].includes(label.source) ? within(container).getByRole("textbox", { name: label }) : within(container).getByLabelText(label);
    fireEvent.change(field, { target: { value } });
  }

  it("opens the availability form inline, validates, and focuses the first error", async () => {
    await renderPage("2022-toyota-camry-se");
    const button = screen.getByRole("button", { name: "Check Availability" });
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("region", { name: "Check availability" });
    expect(document.activeElement).toBe(within(panel).getByRole("heading", { name: "Check availability" }));

    fireEvent.click(within(panel).getByRole("button", { name: "Check Availability" }));
    expect(await within(panel).findByText("Please enter your name.")).toBeTruthy();
    expect(within(panel).getByText("Please agree to be contacted so we can respond.")).toBeTruthy();
    const name = within(panel).getByLabelText(/^Name/);
    expect(document.activeElement).toBe(name);
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(name.getAttribute("aria-describedby")).toContain("name-error");
  });

  it("submits an availability inquiry with the vehicle, type, and attribution", async () => {
    window.sessionStorage.setItem("speedway-attribution", JSON.stringify({ utm_source: "google", gclid: "abc123" }));
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);
    await renderPage("2022-toyota-camry-se");
    fireEvent.click(screen.getByRole("button", { name: "Check Availability" }));
    const panel = screen.getByRole("region", { name: "Check availability" });
    fill(panel, /^Name/, "Jordan Rivera");
    fill(panel, /^Email/, "jordan@example.com");
    fill(panel, /^Phone/, "(555) 123-4567");
    fireEvent.click(within(panel).getByRole("checkbox"));
    fireEvent.click(within(panel).getByRole("button", { name: "Check Availability" }));

    await waitFor(() => expect(callsTo(fetchMock, "/api/vehicle-inquiry")).toHaveLength(1));
    const [, init] = callsTo(fetchMock, "/api/vehicle-inquiry")[0];
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      inquiryType: "availability",
      vehicleSlug: "2022-toyota-camry-se",
      name: "Jordan Rivera",
      email: "jordan@example.com",
      consent: true,
      website: "",
      attribution: { utm_source: "google", gclid: "abc123" },
    });
    expect(await screen.findByText(/we received your request about the 2022 Toyota Camry SE/)).toBeTruthy();
    window.sessionStorage.clear();
  });

  it("requires a message for questions", async () => {
    await renderPage("2022-toyota-camry-se");
    fireEvent.click(screen.getByRole("button", { name: "Ask a Question" }));
    const panel = screen.getByRole("region", { name: "Ask a question" });
    fill(panel, /^Name/, "Jordan Rivera");
    fill(panel, /^Email/, "jordan@example.com");
    fireEvent.click(within(panel).getByRole("checkbox"));
    fireEvent.click(within(panel).getByRole("button", { name: "Send Question" }));
    expect(await within(panel).findByText("Please type your question.")).toBeTruthy();
  });

  it("financing information says it is not a credit application and links the full application", async () => {
    await renderPage("2022-toyota-camry-se");
    fireEvent.click(screen.getByRole("button", { name: "Get Financing Information" }));
    const panel = screen.getByRole("region", { name: "Get financing information" });
    expect(panel.textContent).toMatch(/not a credit application/);
    expect(within(panel).getByRole("link", { name: "Start a finance application" }).getAttribute("href")).toBe("/finance");
    expect(panel.textContent).not.toMatch(/approved|guaranteed/i);
  });

  it("shipping quote collects the destination ZIP and posts to the existing shipping workflow without promising a rate", async () => {
    const fetchMock = okFetch();
    vi.stubGlobal("fetch", fetchMock);
    await renderPage("2022-toyota-camry-se");
    fireEvent.click(screen.getByRole("button", { name: "Request Shipping Quote" }));
    const panel = screen.getByRole("region", { name: "Request a shipping quote" });
    expect(panel.textContent).toMatch(/no rate is quoted automatically/);
    fill(panel, /Full name/, "Jordan Rivera");
    fill(panel, /^Email/, "jordan@example.com");
    fill(panel, /^Phone/, "5551234567");
    fill(panel, /Delivery ZIP/, "30301");
    fireEvent.change(within(panel).getByLabelText(/Delivery state/), { target: { value: "GA" } });
    fireEvent.click(within(panel).getByRole("checkbox"));
    fireEvent.click(within(panel).getByRole("button", { name: "Send Shipping Inquiry" }));
    await waitFor(() => expect(callsTo(fetchMock, "/api/shipping-inquiry")).toHaveLength(1));
    const [, init] = callsTo(fetchMock, "/api/shipping-inquiry")[0];
    expect(JSON.parse(String(init.body))).toMatchObject({ vehicleSlug: "2022-toyota-camry-se", deliveryZip: "30301", deliveryState: "GA" });
  });
});

describe("sticky mobile navigation", () => {
  it("keeps its links and pads for the iPhone home indicator", () => {
    const { container } = render(<StickyMobileCTA />);
    expect(screen.getByRole("link", { name: /Call Speedway Motors/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Browse vehicle inventory" })).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain("pb-[env(safe-area-inset-bottom)]");
  });

  it("the layout reserves the bar's height so it never covers the end of the page", () => {
    const layout = readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
    const bar = readFileSync(path.resolve(__dirname, "../components/layout/StickyMobileCTA.tsx"), "utf8");
    expect(bar).toContain('h-[3.25rem]');
    expect(layout).toMatch(/h-\[calc\(3\.25rem\+env\(safe-area-inset-bottom\)\)\] lg:hidden/);
  });
});
