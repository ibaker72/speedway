// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { Header } from "@/components/layout/Header";
import { ContactForm } from "@/components/forms/ContactForm";
import { FinanceApplicationForm } from "@/components/forms/FinanceApplicationForm";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (window as { gtag?: unknown }).gtag;
});

describe("mobile navigation", () => {
  it("opens and closes the mobile menu with correct ARIA state", () => {
    render(<Header />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);
    const close = screen.getByRole("button", { name: "Close menu" });
    expect(close.getAttribute("aria-expanded")).toBe("true");
    for (const label of ["Inventory", "Financing", "About", "Contact", "Value Your Trade", "Sell Your Car"]) {
      expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByRole("link", { name: /Call Sales/ })[0].getAttribute("href")).toBe("tel:+18622642777");

    fireEvent.click(close);
    expect(screen.queryByRole("button", { name: "Close menu" })).toBeNull();
  });

  it("does not link to the removed team page", () => {
    const { container } = render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(container.querySelector('a[href="/team"]')).toBeNull();
  });
});

describe("contact form", () => {
  it("validates required fields before submitting", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    expect(screen.getByText("Name is required")).toBeTruthy();
    expect(screen.getByText("Email is required")).toBeTruthy();
    expect(screen.getByText("Message is required")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits to /api/contact and tracks a lead without personal data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;

    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Sam Lee" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "sam@example.com" } });
    fireEvent.change(screen.getByLabelText("Your Message"), { target: { value: "Is the Camry available?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => expect(screen.getByText("Message Sent!")).toBeTruthy());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/contact");
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", expect.objectContaining({ lead_type: "contact" }));
    expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/Sam|example\.com|Camry/);
  });

  it("shows an error and keeps the form when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Sam Lee" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "sam@example.com" } });
    fireEvent.change(screen.getByLabelText("Your Message"), { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/Something went wrong/));
  });
});

describe("financing application form", () => {
  it("requires name, email, and phone", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<FinanceApplicationForm />);
    fireEvent.submit(screen.getByLabelText("First Name").closest("form")!);
    expect(screen.getAllByText("Required").length).toBe(4);
    expect(screen.getByLabelText("First Name").getAttribute("aria-invalid")).toBe("true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("submits to /api/finance and never sends financial details to analytics", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;

    render(<FinanceApplicationForm />);
    fireEvent.change(screen.getByLabelText("First Name"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Last Name"), { target: { value: "Diaz" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "862-555-0100" } });
    fireEvent.change(screen.getByLabelText("Monthly Income"), { target: { value: "5200" } });
    fireEvent.submit(screen.getByLabelText("First Name").closest("form")!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/finance");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ firstName: "Ana", monthlyIncome: "5200" });
    await waitFor(() => expect(gtag).toHaveBeenCalled());
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", expect.objectContaining({ lead_type: "finance" }));
    expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/Ana|Diaz|example\.com|5200|862/);
  });
});
