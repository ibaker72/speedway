import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { TrustBadgesRow } from "@/components/home/TrustBadgesRow";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
import { TradeSellCards } from "@/components/home/TradeSellCards";
import { FinanceFormSection } from "@/components/home/FinanceFormSection";
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
      <TradeSellCards />
      <FinanceFormSection />
      <WhyBuySection />
      <TestimonialsSection />
      <FAQSection />
      <LocationsPreview />
    </>
  );
}
