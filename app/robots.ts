import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Only internal endpoints are blocked here. Pages that should stay out of the
 * index (filtered inventory, sold vehicles, utility pages) use a noindex robots
 * meta tag instead, which crawlers can only see if crawling is allowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
