import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { AutoDealerJsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { BUSINESS } from "@/lib/constants";
import "./globals.css";


export const metadata: Metadata = {
  title: {
    default: `${BUSINESS.shortName} | Quality Used Cars in Paterson, NJ`,
    template: `%s | ${BUSINESS.shortName}`,
  },
  description: BUSINESS.description,
  keywords: [
    "used cars paterson nj",
    "used car dealer paterson",
    "buy used car new jersey",
    "auto financing paterson nj",
    "bad credit car loans nj",
    "trade in car paterson",
    "sell my car paterson nj",
    "speedway motors",
    "used SUV paterson",
    "used trucks paterson nj",
    "commercial vehicles paterson",
  ],
  alternates: { canonical: "https://www.speedwaymotorsllc.com/" },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BUSINESS.name,
    title: `${BUSINESS.shortName} | Quality Used Cars in Paterson, NJ`,
    description: BUSINESS.description,
    url: "https://www.speedwaymotorsllc.com/",
    images: [
      {
        url: "https://www.speedwaymotorsllc.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Speedway Motors LLC — Quality Used Cars in Paterson, NJ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.shortName} | Paterson NJ Used Car Dealer`,
    description:
      "Browse 180+ quality used cars, SUVs & trucks. Easy financing available.",
    images: ["https://www.speedwaymotorsllc.com/og-image.jpg"],
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <AutoDealerJsonLd />
        <FAQPageJsonLd />
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
