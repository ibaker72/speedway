import { HeroSection } from "@/components/home/HeroSection";
import { TrustBadgesRow } from "@/components/home/TrustBadgesRow";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import { BodyTypeShortcuts } from "@/components/home/BodyTypeShortcuts";
import { FinanceCTABand } from "@/components/home/FinanceCTABand";
import { TradeSellCards } from "@/components/home/TradeSellCards";
import { WhyBuySection } from "@/components/home/WhyBuySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { LocationsPreview } from "@/components/home/LocationsPreview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBadgesRow />
      <FeaturedInventory />
      <BodyTypeShortcuts />
      <FinanceCTABand />
      <TradeSellCards />
      <WhyBuySection />
      <TestimonialsSection />
      <LocationsPreview />
    </>
  );
}
