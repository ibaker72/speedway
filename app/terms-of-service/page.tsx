import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Speedway Motors LLC website usage.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="These placeholder terms govern use of the Speedway Motors LLC website and online inquiries."
      />
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto space-y-6 text-zinc-300 leading-relaxed">
          <p>Website content is provided for informational purposes and may change without notice.</p>
          <p>Vehicle pricing, availability, and financing terms are subject to verification at the dealership.</p>
          <p>By submitting forms, you confirm that provided information is accurate and authorized.</p>
          <p>Use of this website constitutes acceptance of these terms and applicable state and federal regulations.</p>
        </div>
      </SectionWrapper>
    </>
  );
}
