import { Truck, Phone } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial Vehicles",
  description:
    "Commercial trucks, vans, and work vehicles available at Speedway Motors in Paterson, NJ. Fleet pricing and commercial financing available.",
};

export default function CommercialPage() {
  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Commercial Vehicles"
        subtitle="Work trucks, cargo vans, and fleet vehicles for your business."
        as="h1"
      />

      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-6">
          <Truck className="h-8 w-8 text-zinc-600" />
        </div>
        <p className="text-zinc-600 mb-8 leading-relaxed">
          Our commercial department specializes in work-ready vehicles for
          businesses of all sizes. From box trucks to cargo vans, we carry a
          rotating selection of commercial vehicles. Fleet pricing and commercial
          financing options are available — contact our team to discuss your
          needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
            <Phone className="h-4 w-4" />
            Call {BUSINESS.phone}
          </Button>
          <Button href="/inventory" variant="outline" size="lg">
            Browse Inventory
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
}
