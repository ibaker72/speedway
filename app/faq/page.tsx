import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { FAQSection } from "@/components/home/FAQSection";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about buying a used car, financing, trade-ins, and more at Speedway Motors in Paterson, NJ.",
};

export default function FAQPage() {
  return (
    <>
      <FAQSection />
      <SectionWrapper background="dark" className="py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Still have questions?
          </h2>
          <p className="text-sm text-zinc-400 mb-6">
            Our team is happy to help. Give us a call or visit us in person.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href={BUSINESS.phoneHref} variant="primary" size="md">
              <Phone className="h-4 w-4" />
              Call {BUSINESS.phone}
            </Button>
            <Button href="/contact" variant="outline" size="md">
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
