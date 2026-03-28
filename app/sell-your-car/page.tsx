import { DollarSign, Phone } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Car",
  description: "Sell your car directly to Speedway Motors — no trade required. Get a competitive offer and get paid fast.",
};

export default function SellYourCarPage() {
  return (
    <SectionWrapper background="white">
      <SectionHeading title="Sell Your Car" subtitle="Want to sell without buying? We purchase vehicles directly — no trade required." as="h1" />
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mb-6">
          <DollarSign className="h-8 w-8 text-red-700" />
        </div>
        <p className="text-zinc-500 mb-8 leading-relaxed">
          We buy cars, trucks, SUVs, and vans. Submit your vehicle details and we&apos;ll provide a competitive offer. The process is quick, transparent, and hassle-free. Get paid and walk away — it&apos;s that simple.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={BUSINESS.phoneHref} variant="primary" size="lg"><Phone className="h-4 w-4" />Call {BUSINESS.phone}</Button>
          <Button href="/contact" variant="outline" size="lg">Contact Us</Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
