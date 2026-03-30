import type { MetadataRoute } from "next";
import { getInventory } from "@/lib/data/inventory-source";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsllc.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/inventory",
    "/finance",
    "/trade",
    "/sell-your-car",
    "/about",
    "/contact",
    "/reviews",
    "/faq",
    "/commercial",
    "/warranty",
    "/specials",
    "/privacy-policy",
    "/terms-of-service",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1 : route === "/inventory" ? 0.9 : 0.7,
  }));

  const { vehicles } = await getInventory({ perPage: 999 });
  const vehiclePages = vehicles.map((v) => ({
    url: `${BASE_URL}/inventory/${v.slug}`,
    lastModified: new Date(v.dateModified || v.dateAdded),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...vehiclePages];
}
