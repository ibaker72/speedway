import type { MetadataRoute } from "next";
import { getInventory } from "@/lib/data/inventory-source";
import { serviceAreas } from "@/lib/data/service-areas";
import { blogPosts } from "@/lib/data/blog-posts";

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
    "/calculator",
    "/guides/car-buying-guide",
    "/value-my-car",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === ""
      ? 1
      : route === "/inventory"
        ? 0.9
        : ["/guides/car-buying-guide", "/value-my-car"].includes(route)
          ? 0.8
          : 0.7,
  }));

  const { vehicles } = await getInventory({ perPage: 999 });
  const vehiclePages = vehicles.map((v) => ({
    url: `${BASE_URL}/inventory/${v.slug}`,
    lastModified: new Date(v.dateModified || v.dateAdded),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const locationPages = [
    {
      url: `${BASE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    ...serviceAreas.map((area) => ({
      url: `${BASE_URL}/locations/${area.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const blogPages = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticPages, ...vehiclePages, ...locationPages, ...blogPages];
}
