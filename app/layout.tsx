import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { AutoDealerJsonLd, FAQPageJsonLd } from "@/components/seo/JsonLd";
import { BUSINESS } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

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
  alternates: { canonical: "https://www.speedwaymotorsnj.net/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BUSINESS.name,
    title: `${BUSINESS.shortName} | Quality Used Cars in Paterson, NJ`,
    description: BUSINESS.description,
    url: "https://www.speedwaymotorsnj.net/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.shortName} | Paterson NJ Used Car Dealer`,
    description:
      "Browse 180+ quality used cars, SUVs & trucks. Easy financing available.",
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
        className={`${inter.className} min-h-full flex flex-col font-sans antialiased bg-[#000000] text-white`}
      >
        <AutoDealerJsonLd />
        <FAQPageJsonLd />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <StickyMobileCTA />
      </body>
    </html>
  );
}
