import type { MetadataRoute } from "next";
import { dealerConfig } from "@/dealer.config";
import { getInventory, getMakeSummaries } from "@/lib/data/inventory-source";
import { geoLocations } from "@/lib/geo/locations";
import { blogPosts } from "@/lib/data/blog-posts";
import { MIN_VEHICLES_FOR_MAKE_PAGE, makePagePath } from "@/lib/inventory/make-pages";
import { absoluteUrl } from "@/lib/seo/site";
import type { Vehicle } from "@/lib/types/vehicle";

// Regenerate at most hourly so new arrivals appear and sold vehicles drop out
// without waiting for a redeploy (previously the sitemap was frozen at build).
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

// Indexable static pages. lastModified is omitted for these on purpose: a
// timestamp that changes on every build tells search engines nothing.
// /commercial and /specials are added below only when they have vehicles.
// Excluded: /admin, /api, /proposal, /compare and /alerts (utility pages),
// /team (removed), filtered or sorted /inventory URLs, and sold vehicles.
const STATIC_PAGES: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/inventory", priority: 0.9, changeFrequency: "daily" },
  { path: "/finance", priority: 0.8, changeFrequency: "monthly" },
  { path: "/trade", priority: 0.8, changeFrequency: "monthly" },
  { path: "/sell-your-car", priority: 0.8, changeFrequency: "monthly" },
  { path: "/value-my-car", priority: 0.7, changeFrequency: "monthly" },
  { path: "/guides/car-buying-guide", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/warranty", priority: 0.5, changeFrequency: "monthly" },
  { path: "/calculator", priority: 0.5, changeFrequency: "yearly" },
  { path: "/locations", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.2, changeFrequency: "yearly" },
];

function vehicleLastModified(vehicle: Vehicle): Date | undefined {
  const value = vehicle.dateModified || vehicle.dateAdded;
  const date = value ? new Date(value) : undefined;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let vehicles: Vehicle[] = [];
  try {
    ({ vehicles } = await getInventory({ perPage: 999 }));
  } catch {
    // Inventory unavailable — publish the rest of the sitemap without vehicles.
  }
  const makes = await getMakeSummaries().catch(() => []);

  const newestInventoryChange = vehicles
    .map(vehicleLastModified)
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const staticPages: Entry[] = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    // The homepage and inventory list change whenever inventory does.
    ...((path === "/" || path === "/inventory") && newestInventoryChange ? { lastModified: newestInventoryChange } : {}),
    changeFrequency,
    priority,
  }));

  if (dealerConfig.features.nationwideShipping) {
    staticPages.push({ url: absoluteUrl("/nationwide-car-shipping"), changeFrequency: "monthly", priority: 0.8 });
  }
  // Only list inventory-driven pages while they have something to show.
  if (vehicles.some((vehicle) => vehicle.isCommercial)) {
    staticPages.push({ url: absoluteUrl("/commercial"), changeFrequency: "weekly", priority: 0.6 });
  }
  if (vehicles.some((vehicle) => vehicle.isFeatured)) {
    staticPages.push({ url: absoluteUrl("/specials"), changeFrequency: "daily", priority: 0.6 });
  }

  const makePages: Entry[] = makes
    .filter((make) => make.count >= MIN_VEHICLES_FOR_MAKE_PAGE)
    .map((make) => ({
      url: absoluteUrl(makePagePath(make.slug)),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const vehiclePages: Entry[] = vehicles.map((vehicle) => {
    const lastModified = vehicleLastModified(vehicle);
    const images = vehicle.images.map((image) => image.url).filter(Boolean).slice(0, 5);
    return {
      url: absoluteUrl(`/inventory/${vehicle.slug}`),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
      ...(images.length ? { images } : {}),
    };
  });

  const locationPages: Entry[] = dealerConfig.features.geoPages
    ? geoLocations.map((location) => ({
        url: absoluteUrl(`/locations/${location.slug}`),
        changeFrequency: "monthly",
        priority: 0.5,
      }))
    : [];

  // The blog is only listed when it is enabled and has published posts.
  const blogPages: Entry[] =
    dealerConfig.features.blog && blogPosts.length > 0
      ? [
          { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.6 },
          ...blogPosts.map((post) => ({
            url: absoluteUrl(`/blog/${post.slug}`),
            lastModified: new Date(post.dateModified),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          })),
        ]
      : [];

  return [...staticPages, ...makePages, ...vehiclePages, ...locationPages, ...blogPages];
}
