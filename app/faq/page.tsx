import { FAQSection } from "@/components/home/FAQSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about buying a used car, financing, trade-ins, and more at Speedway Motors in Paterson, NJ.",
};

export default function FAQPage() {
  return <FAQSection />;
}
