import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { ValueMyCarForm } from "./ValueMyCarForm";

export const metadata: Metadata = {
  title: "What's My Car Worth? | Free Instant Vehicle Value Estimate",
  description:
    "Find out what your car is worth in 60 seconds. Free, no-obligation market estimate from Speedway Motors in Paterson, NJ. Trade in or sell your vehicle today.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/value-my-car",
  },
};

export default function ValueMyCarPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Value My Car", url: `${BUSINESS.website}/value-my-car` },
        ]}
      />

      <PageHero
        eyebrow="Free Tool"
        title="What's My Car Worth?"
        subtitle="Get a free market estimate in under 60 seconds. No obligation, no pressure."
      />

      <SectionWrapper background="charcoal">
        <div className="max-w-lg mx-auto">
          <ValueMyCarForm />
        </div>
      </SectionWrapper>
    </>
  );
}
