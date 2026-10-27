// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { render, cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import axe from "axe-core";
import { ShippingPromoSection } from "@/components/home/ShippingPromoSection";
import { ShippingInquiryForm } from "@/components/forms/ShippingInquiryForm";
import { VehicleShippingCta } from "@/components/inventory/VehicleShippingCta";
import NationwideShippingPage from "@/app/nationwide-car-shipping/page";
import { SHIPPING_FAQS, SHIPPING_STEPS } from "@/lib/data/shipping-content";

beforeAll(() => {
  // AnimateIn relies on IntersectionObserver, which jsdom does not provide.
  class StubObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", StubObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  delete (window as { gtag?: unknown }).gtag;
});

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    // jsdom cannot compute colors or layout; landmark rules don't apply to fragments.
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
}

function fill(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("homepage shipping CTA", () => {
  it("shows the shipping message with links to inventory and the shipping page", () => {
    render(<ShippingPromoSection />);
    expect(screen.getByRole("heading", { name: "Shop Locally. Buy From Anywhere." })).toBeTruthy();
    expect(screen.getByText(/ask our team about nationwide vehicle shipping options/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Explore Inventory/ }).getAttribute("href")).toBe("/inventory");
    expect(screen.getByRole("link", { name: "Ask About Vehicle Shipping" }).getAttribute("href")).toBe("/nationwide-car-shipping");
  });

  it("makes no free-shipping, price, or transit-time promises", () => {
    const { container } = render(<ShippingPromoSection />);
    expect(container.textContent).not.toMatch(/free|\$\d|guarantee|days/i);
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ShippingPromoSection />);
    await expectNoAxeViolations(container);
  });
});

describe("vehicle detail shipping CTA", () => {
  it("links to the inquiry form with the vehicle attached", () => {
    render(<VehicleShippingCta slug="2022-toyota-camry-se" />);
    expect(screen.getByText("Interested in this vehicle from out of state? Ask about nationwide shipping.")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      "/nationwide-car-shipping?vehicle=2022-toyota-camry-se#shipping-inquiry"
    );
  });
});

describe("nationwide shipping landing page", () => {
  it("renders the H1, five-step journey, FAQ, and matching FAQ structured data", async () => {
    const { container } = render(await NationwideShippingPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Nationwide Vehicle Shipping from Speedway Motors");
    expect(SHIPPING_STEPS).toHaveLength(5);
    const steps = container.querySelectorAll("ol > li");
    expect(steps).toHaveLength(5);
    expect(steps[0].textContent).toContain("Browse available vehicles");
    expect(steps[4].textContent).toContain("Coordinate the purchase and delivery");
    for (const faq of SHIPPING_FAQS) expect(screen.getByRole("heading", { name: faq.question })).toBeTruthy();

    const ld = [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent!));
    const faqPage = ld.find((d) => d["@type"] === "FAQPage");
    expect(faqPage.mainEntity.map((q: { name: string }) => q.name)).toEqual(SHIPPING_FAQS.map((f) => f.question));
    expect(ld.some((d) => d["@type"] === "BreadcrumbList")).toBe(true);
  });

  it("does not publish prices, guaranteed delivery, or a dealer-owned fleet claim", async () => {
    const { container } = render(await NationwideShippingPage({ searchParams: Promise.resolve({}) }));
    const text = container.textContent || "";
    expect(text).not.toMatch(/free shipping|we guarantee|guaranteed (delivery|to arrive) (in|by|within)|our (own )?(trucks|fleet)/i);
    // No dollar amounts at all when no vehicle is attached (so no shipping prices).
    expect(text).not.toMatch(/\$\d/);
    // The only "guarantee" wording is the disclaimer that timing is an estimate.
    expect(text).toContain("an estimate rather than a guaranteed delivery date");
  });

  it("pre-fills and attaches the vehicle when arriving from a vehicle page", async () => {
    render(await NationwideShippingPage({ searchParams: Promise.resolve({ vehicle: "2022-toyota-camry-se" }) }));
    expect((screen.getByLabelText(/Vehicle of interest/) as HTMLInputElement).value).toBe("2022 Toyota Camry SE");
    expect((document.querySelector('input[name="vehicleSlug"]') as HTMLInputElement).value).toBe("2022-toyota-camry-se");
    expect(screen.getByText("Vehicle on this inquiry")).toBeTruthy();
  });

  it("ignores unknown or malformed vehicle references", async () => {
    render(await NationwideShippingPage({ searchParams: Promise.resolve({ vehicle: "<script>" }) }));
    expect((screen.getByLabelText(/Vehicle of interest/) as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("Vehicle on this inquiry")).toBeNull();
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(await NationwideShippingPage({ searchParams: Promise.resolve({ vehicle: "2022-toyota-camry-se" }) }));
    await expectNoAxeViolations(container);
  });
});

describe("shipping inquiry form", () => {
  it("shows accessible, field-level errors and focuses the first invalid field", async () => {
    render(<ShippingInquiryForm />);
    fireEvent.click(screen.getByRole("button", { name: "Send Shipping Inquiry" }));
    const name = screen.getByLabelText(/Full name/);
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(name.getAttribute("aria-describedby")).toBe("shipping-name-error");
    expect(document.getElementById("shipping-name-error")?.textContent).toBe("Please enter your full name.");
    expect(document.activeElement).toBe(name);
    expect(screen.getByLabelText(/I agree that Speedway Motors may contact me/).getAttribute("aria-invalid")).toBe("true");
  });

  it("submits the inquiry with the vehicle reference and fires a PII-free lead event", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;

    render(<ShippingInquiryForm vehicle={{ slug: "2022-toyota-camry-se", title: "2022 Toyota Camry SE" }} />);
    fill(/Full name/, "Jordan Rivera");
    fill(/Email/, "jordan@example.com");
    fill(/Phone/, "555-123-4567");
    fill(/Delivery ZIP code/, "30301");
    fireEvent.change(screen.getByLabelText(/Delivery state/), { target: { value: "GA" } });
    fireEvent.click(screen.getByLabelText(/I agree that Speedway Motors may contact me/));
    fireEvent.click(screen.getByRole("button", { name: "Send Shipping Inquiry" }));

    await waitFor(() => expect(screen.getByRole("status")).toBeTruthy());
    expect(within(screen.getByRole("status")).getByText(/we received your shipping inquiry/)).toBeTruthy();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/shipping-inquiry");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      vehicleSlug: "2022-toyota-camry-se",
      vehicleOfInterest: "2022 Toyota Camry SE",
      deliveryZip: "30301",
      deliveryState: "GA",
      consent: true,
      website: "",
    });

    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", expect.objectContaining({ lead_type: "shipping", vehicle_slug: "2022-toyota-camry-se" }));
    const params = gtag.mock.calls[0][2];
    expect(JSON.stringify(params)).not.toMatch(/Jordan|example\.com|555|30301/);
  });

  it("surfaces server-side field errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Please correct the highlighted fields.", errors: { deliveryZip: "Please enter a valid 5-digit ZIP code." } }), { status: 400 })
      )
    );
    render(<ShippingInquiryForm vehicle={{ slug: "x", title: "2022 Toyota Camry SE" }} />);
    fill(/Full name/, "Jordan Rivera");
    fill(/Email/, "jordan@example.com");
    fill(/Phone/, "5551234567");
    fill(/Delivery ZIP code/, "30301");
    fireEvent.change(screen.getByLabelText(/Delivery state/), { target: { value: "GA" } });
    fireEvent.click(screen.getByLabelText(/I agree/));
    fireEvent.click(screen.getByRole("button", { name: "Send Shipping Inquiry" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Please correct the highlighted fields."));
    expect(screen.getByText("Please enter a valid 5-digit ZIP code.")).toBeTruthy();
  });

  it("has no detectable accessibility violations, including in the error state", async () => {
    const { container } = render(<ShippingInquiryForm />);
    await expectNoAxeViolations(container);
    fireEvent.click(screen.getByRole("button", { name: "Send Shipping Inquiry" }));
    await expectNoAxeViolations(container);
  });
});
