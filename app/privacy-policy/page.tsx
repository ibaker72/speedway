import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Speedway Motors LLC website visitors and customers.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="This placeholder policy explains how Speedway Motors LLC collects, uses, and protects your information."
      />
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto space-y-6 text-zinc-300 leading-relaxed">
          <p>We collect information you submit through forms, phone calls, and website interactions.</p>
          <p>Information may be used to respond to inquiries, process financing applications, and improve customer service.</p>
          <p>We do not sell your personal information. We only share data with trusted partners required to provide requested services.</p>
          <p>Contact us if you would like to review, update, or remove personal data associated with your request.</p>
        </div>
      </SectionWrapper>
    </>
  );
}
