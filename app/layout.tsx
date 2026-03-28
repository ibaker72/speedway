import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
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
    "auto financing paterson nj",
    "trade in car paterson",
    "sell my car paterson nj",
    "speedway motors",
    "commercial vehicles paterson",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BUSINESS.name,
    title: `${BUSINESS.shortName} | Quality Used Cars in Paterson, NJ`,
    description: BUSINESS.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <StickyMobileCTA />
      </body>
    </html>
  );
}
