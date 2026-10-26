import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { ValueMyCarForm } from "./ValueMyCarForm";

export const metadata: Metadata = pageMetadata({
  title: "What's My Car Worth? Free Vehicle Value Estimate",
  description:
    "Request a free, no-obligation value estimate for your car from Speedway Motors in Paterson, NJ, then trade it in or sell it to us.",
  path: "/value-my-car",
});

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
