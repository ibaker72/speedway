import { describe, it, expect } from "vitest";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL, absoluteUrl } from "@/lib/seo/site";
import { hasInventoryRefinements } from "@/lib/inventory/filter-params";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import nextConfig from "@/next.config";
import { generateMetadata as inventoryMetadata } from "@/app/inventory/(listing)/page";
import { generateMetadata as vehicleMetadata } from "@/app/inventory/[slug]/page";
import { generateMetadata as makeMetadata } from "@/app/inventory/make/[make]/page";
import { metadata as homeMetadata } from "@/app/page";

const params = (value: Record<string, string | string[] | undefined>) => ({ searchParams: Promise.resolve(value) });

describe("canonical URL generation", () => {
  it("builds absolute URLs on the www production origin", () => {
    expect(SITE_URL).toBe("https://www.speedwaymotorsllc.com");
    expect(absoluteUrl("/")).toBe("https://www.speedwaymotorsllc.com/");
    expect(absoluteUrl("/finance")).toBe("https://www.speedwaymotorsllc.com/finance");
    expect(absoluteUrl("finance")).toBe("https://www.speedwaymotorsllc.com/finance");
  });

  it("gives every page its own canonical, og:url, and share title", () => {
    const meta = pageMetadata({ title: "Auto Financing", description: "d", path: "/finance" });
    expect(meta.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/finance");
    expect(meta.openGraph).toMatchObject({
      url: "https://www.speedwaymotorsllc.com/finance",
      title: "Auto Financing | Speedway Motors",
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("supports noindex while still allowing link discovery", () => {
    const meta = pageMetadata({ title: "x", description: "d", path: "/alerts", noindex: true });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it("uses an absolute title on the homepage, where the template does not apply", () => {
    expect(homeMetadata.title).toEqual({ absolute: "Used Cars for Sale in Paterson, NJ | Speedway Motors" });
    expect(homeMetadata.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/");
  });
});

describe("inventory listing indexing rules", () => {
  it("detects filter, sort, and search parameters but ignores pagination", () => {
    expect(hasInventoryRefinements({})).toBe(false);
    expect(hasInventoryRefinements({ page: "2" })).toBe(false);
    expect(hasInventoryRefinements({ make: "Toyota" })).toBe(true);
    expect(hasInventoryRefinements({ sort: "price-asc" })).toBe(true);
    expect(hasInventoryRefinements({ feature: ["Sunroof"] })).toBe(true);
    expect(hasInventoryRefinements({ search: "" })).toBe(false);
  });

  it("indexes the clean listing with a self-referencing canonical", async () => {
    const meta = await inventoryMetadata(params({}));
    expect(meta.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/inventory");
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("noindexes filtered views and points their canonical at the clean listing", async () => {
    const meta = await inventoryMetadata(params({ make: "Toyota", sort: "price-asc" }));
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/inventory");
  });

  it("noindexes page numbers past the end of the listing", async () => {
    const meta = await inventoryMetadata(params({ page: "50" }));
    expect(meta.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/inventory?page=50");
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});

describe("dynamic vehicle metadata", () => {
  it("uses the '<year> <make> <model> <trim> for Sale' title format from inventory data", async () => {
    const meta = await vehicleMetadata({ params: Promise.resolve({ slug: "2022-toyota-camry-se" }) });
    expect(meta.title).toBe("2022 Toyota Camry SE for Sale");
    expect(meta.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/inventory/2022-toyota-camry-se");
    expect(meta.description).toContain("28,450 mi");
    expect(meta.description).toContain("$24,995");
    expect(meta.description).toContain("Paterson, NJ");
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("noindexes a vehicle that is no longer in stock", async () => {
    const meta = await vehicleMetadata({ params: Promise.resolve({ slug: "sold-or-missing-vehicle" }) });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });

  it("builds make landing page metadata only for makes with enough stock", async () => {
    const toyota = await makeMetadata({ params: Promise.resolve({ make: "toyota" }) });
    expect(toyota.title).toBe("Used Toyota for Sale in Paterson, NJ");
    expect(toyota.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/inventory/make/toyota");
    const missing = await makeMetadata({ params: Promise.resolve({ make: "not-a-make" }) });
    expect(missing.robots).toEqual({ index: false, follow: true });
  });
});

describe("XML sitemap", () => {
  it("lists canonical public pages, make pages, shipping, and in-stock vehicles", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain("https://www.speedwaymotorsllc.com/");
    expect(urls).toContain("https://www.speedwaymotorsllc.com/inventory");
    expect(urls).toContain("https://www.speedwaymotorsllc.com/nationwide-car-shipping");
    expect(urls).toContain("https://www.speedwaymotorsllc.com/inventory/make/toyota");
    expect(urls).toContain("https://www.speedwaymotorsllc.com/inventory/2022-toyota-camry-se");
    expect(urls.every((url) => url.startsWith("https://www.speedwaymotorsllc.com/"))).toBe(true);
  });

  it("excludes removed, internal, filtered, and empty pages", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.includes("?"))).toBe(false);
    expect(urls.some((url) => /\/(team|admin|api|proposal|compare|alerts)(\/|$)/.test(url))).toBe(false);
    // The blog has no posts, so neither the index nor post URLs are listed.
    expect(urls.some((url) => url.includes("/blog"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("uses real inventory timestamps instead of the build time", async () => {
    const entries = await sitemap();
    const camry = entries.find((entry) => entry.url.endsWith("/inventory/2022-toyota-camry-se"));
    expect(camry?.lastModified).toBeInstanceOf(Date);
    expect((camry?.lastModified as Date).toISOString().startsWith("20")).toBe(true);
    const about = entries.find((entry) => entry.url.endsWith("/about"));
    expect(about?.lastModified).toBeUndefined();
  });
});

describe("robots and host-level directives", () => {
  it("blocks only internal endpoints and points to the canonical sitemap", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0].allow).toBe("/");
    expect(rules[0].disallow).toEqual(["/api/", "/admin/"]);
    expect(result.sitemap).toBe("https://www.speedwaymotorsllc.com/sitemap.xml");
  });

  it("permanently redirects the removed team page and noindexes *.vercel.app hosts", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({ source: "/team", destination: "/about", permanent: true });
    const headers = await nextConfig.headers!();
    const vercelRule = headers.find((rule) => rule.has?.some((h) => h.type === "host"));
    expect(vercelRule?.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex" });
  });
});
