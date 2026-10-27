import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { AutoDealerJsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { SiteTracking } from "@/components/analytics/SiteTracking";
import { BUSINESS } from "@/lib/constants";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Used Cars for Sale in Paterson, NJ | Speedway Motors",
    template: "%s | Speedway Motors",
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.name,
  // Canonical and Open Graph URLs are set per page (see lib/seo/metadata.ts);
  // defining them here would leak the homepage URL onto every other page.
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BUSINESS.name,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className="min-h-full flex flex-col font-sans antialiased bg-[#000000] text-white"
      >
        <GoogleAnalytics />
        <FacebookPixel />
        <GoogleTagManager />
        <SiteTracking />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <AutoDealerJsonLd />
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <StickyMobileCTA />
        <CookieConsent />
      </body>
    </html>
  );
}
