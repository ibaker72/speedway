import type { Metadata } from "next";
import { dealerConfig } from "@/dealer.config";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo/site";

export interface PageMetadataInput {
  /**
   * Page-specific title. The root layout template appends " | Speedway Motors"
   * for nested routes. The homepage shares the root segment, where the
   * template does not apply, so it passes `absoluteTitle` instead.
   */
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** Site-relative canonical path, e.g. "/finance". */
  path: string;
  images?: { url: string; alt?: string; width?: number; height?: number }[];
  /** Use for thin, utility, or duplicate pages that should stay out of the index. */
  noindex?: boolean;
  type?: "website" | "article";
}

/**
 * Builds complete per-page metadata. Next.js replaces (does not merge) nested
 * objects like `openGraph`, so pages that only set `title` would otherwise
 * inherit the homepage's og:url and og:title. Every public page goes through
 * this helper so canonical, Open Graph, and Twitter data always describe the
 * page itself.
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  images,
  noindex = false,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const shareTitle = absoluteTitle ? title : `${title} | ${dealerConfig.shortName}`;
  const shareImages = images?.length ? images : [DEFAULT_OG_IMAGE];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: "en_US",
      siteName: dealerConfig.name,
      url,
      title: shareTitle,
      description,
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: shareImages.map((image) => image.url),
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
  };
}
