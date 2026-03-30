import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
import { TradeSellCards } from "@/components/home/TradeSellCards";
import { WhyBuySection } from "@/components/home/WhyBuySection";
import { FinanceFormSection } from "@/components/home/FinanceFormSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { FAQSection } from "@/components/home/FAQSection";
import { LocationsPreview } from "@/components/home/LocationsPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedInventory />
      <BodyTypeShortcuts />
      <TradeSellCards />
      <WhyBuySection />
      <FinanceFormSection />
      <TestimonialsSection />
      <BrandMarquee />
      <FAQSection />
      <LocationsPreview />
    </>
  );
}
