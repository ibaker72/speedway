import { HeroSection } from "@/components/home/HeroSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { EmailMagnetSection } from "@/components/home/EmailMagnetSection";
import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
import { TradeSellCards } from "@/components/home/TradeSellCards";
import { WhyBuySection } from "@/components/home/WhyBuySection";
import { FinanceFormSection } from "@/components/home/FinanceFormSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustBadgesRow } from "@/components/home/TrustBadgesRow";
import { FAQSection } from "@/components/home/FAQSection";
import { LocationsPreview } from "@/components/home/LocationsPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadgesRow />
      <BrandMarquee />
      <FeaturedInventory />
      <BodyTypeShortcuts />
      <TradeSellCards />
      <WhyBuySection />
      <FinanceFormSection />
      <TestimonialsSection />
      <FAQSection />
      <LocationsPreview />
      <EmailMagnetSection />
    </>
  );
}
