import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { EmailMagnetSection } from "@/components/home/EmailMagnetSection";
import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
import { TradeSellCards } from "@/components/home/TradeSellCards";
import { WhyBuySection } from "@/components/home/WhyBuySection";
import { StatsShowcase } from "@/components/home/StatsShowcase";
import { NewArrivals } from "@/components/home/NewArrivals";
import { FinanceFormSection } from "@/components/home/FinanceFormSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustBadgesRow } from "@/components/home/TrustBadgesRow";
import { FAQSection } from "@/components/home/FAQSection";
import { LocationsPreview } from "@/components/home/LocationsPreview";
import { ShippingPromoSection } from "@/components/home/ShippingPromoSection";
import { dealerConfig } from "@/dealer.config";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

// Rebuild the page in the background at most every 5 minutes. Inventory
// queries are cached for 60s anyway, so this keeps listings fresh while
// serving cached HTML instead of rendering on every request.
export const revalidate = 300;

export const metadata: Metadata = pageMetadata({
  title: "Used Cars for Sale in Paterson, NJ | Speedway Motors",
  absoluteTitle: true,
  description: dealerConfig.features.nationwideShipping
    ? "Speedway Motors is a used car dealership in Paterson, NJ. Shop quality used cars, SUVs, trucks, and vans, apply for financing with any credit, and ask about nationwide vehicle shipping."
    : "Speedway Motors is a used car dealership in Paterson, NJ. Shop quality used cars, SUVs, trucks, and vans and apply for financing with any credit.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadgesRow />
      {dealerConfig.features.nationwideShipping && <ShippingPromoSection />}
      <BrandMarquee />
      <FeaturedInventory />
      <NewArrivals />
      <BodyTypeShortcuts />
      <TradeSellCards />
      <WhyBuySection />
      <StatsShowcase />
      <FinanceFormSection />
      <TestimonialsSection />
      <FAQSection />
      <LocationsPreview />
      <EmailMagnetSection />
    </>
  );
}
