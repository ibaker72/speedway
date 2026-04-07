import type { MetadataRoute } from "next";
import { getInventory } from "@/lib/data/inventory-source";
import { geoLocations } from "@/lib/geo/locations";
import { blogPosts } from "@/lib/data/blog-posts";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsllc.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { route: "", priority: 1.0, freq: "daily" as const },
    { route: "/inventory", priority: 0.9, freq: "daily" as const },
    { route: "/finance", priority: 0.8, freq: "weekly" as const },
    { route: "/trade", priority: 0.8, freq: "weekly" as const },
    { route: "/sell-your-car", priority: 0.8, freq: "weekly" as const },
    { route: "/value-my-car", priority: 0.8, freq: "weekly" as const },
    { route: "/guides/car-buying-guide", priority: 0.8, freq: "monthly" as const },
    { route: "/about", priority: 0.7, freq: "monthly" as const },
    { route: "/contact", priority: 0.7, freq: "monthly" as const },
    { route: "/reviews", priority: 0.7, freq: "monthly" as const },
    { route: "/faq", priority: 0.7, freq: "monthly" as const },
    { route: "/commercial", priority: 0.7, freq: "weekly" as const },
    { route: "/warranty", priority: 0.6, freq: "monthly" as const },
    { route: "/specials", priority: 0.8, freq: "daily" as const },
    { route: "/calculator", priority: 0.6, freq: "monthly" as const },
    { route: "/privacy-policy", priority: 0.3, freq: "yearly" as const },
    { route: "/terms-of-service", priority: 0.3, freq: "yearly" as const },
  ].map(({ route, priority, freq }) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  const { vehicles } = await getInventory({ perPage: 999 });
  const vehiclePages = vehicles.map((v) => ({
    url: `${BASE_URL}/inventory/${v.slug}`,
    lastModified: new Date(v.dateModified || v.dateAdded),
    // Featured/new arrivals get higher crawl priority and frequency
    changeFrequency: (v.isFeatured || v.isNewArrival ? "daily" : "weekly") as "daily" | "weekly",
    priority: v.isFeatured ? 0.9 : v.isNewArrival ? 0.85 : 0.7,
  }));

  const locationPages = [
    {
      url: `${BASE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...geoLocations.map((location) => ({
      url: `${BASE_URL}/locations/${location.slug}`,
      lastModified: new Date(),
      // Geo pages reference live inventory — refresh weekly
      changeFrequency: "weekly" as const,
      priority: location.distanceMiles <= 5 ? 0.8 : 0.7,
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
