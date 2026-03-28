import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { TrustBadgesRow } from "@/components/home/TrustBadgesRow";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
import { PriceRangeShortcuts } from "@/components/home/PriceRangeShortcuts";
import { FinanceCTABand } from "@/components/home/FinanceCTABand";
import { FinanceFormSection } from "@/components/home/FinanceFormSection";
import { TradeSellCards } from "@/components/home/TradeSellCards";
import { WhyBuySection } from "@/components/home/WhyBuySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { LocationsPreview } from "@/components/home/LocationsPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <TrustBadgesRow />
      <FeaturedInventory />
      <BodyTypeShortcuts />
      <PriceRangeShortcuts />
      <FinanceCTABand />
      <FinanceFormSection />
      <TradeSellCards />
      <WhyBuySection />
      <TestimonialsSection />
      <FAQSection />
      <LocationsPreview />
    </>
  );
}
