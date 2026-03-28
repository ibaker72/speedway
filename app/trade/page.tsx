import { ArrowRightLeft, Phone } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade-In Your Vehicle",
  description: "Get a competitive trade-in value for your current vehicle at Speedway Motors. Apply the value toward any car in our inventory.",
};

export default function TradePage() {
  return (
    <SectionWrapper background="white">
      <SectionHeading title="Value Your Trade" subtitle="Get a fair market estimate for your current vehicle and apply it toward your next car." as="h1" />
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center mb-6">
          <ArrowRightLeft className="h-8 w-8 text-zinc-600" />
        </div>
        <p className="text-zinc-500 mb-8 leading-relaxed">
          Thinking about upgrading? We offer competitive trade-in values based on current market data. Bring your vehicle to any of our locations for a quick, no-obligation appraisal. You can apply your trade-in value directly toward any vehicle in our inventory.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={BUSINESS.phoneHref} variant="primary" size="lg"><Phone className="h-4 w-4" />Call {BUSINESS.phone}</Button>
          <Button href="/inventory" variant="outline" size="lg">Browse Inventory</Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
