import { FinanceFormSection } from "@/components/home/FinanceFormSection";
import { FinanceCTABand } from "@/components/home/FinanceCTABand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Financing",
  description:
    "Get pre-approved for auto financing at Speedway Motors. All credit levels welcome. Quick decisions and competitive rates from trusted NJ lenders.",
};

export default function FinancePage() {
  return (
    <>
      <FinanceCTABand />
      <FinanceFormSection />
    </>
  );
}
