import { PageHero } from "@/components/shared/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { InlineLeadCTA } from "@/components/shared/InlineLeadCTA";
import { BUSINESS } from "@/lib/constants";
import { CalculatorForm } from "./CalculatorForm";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Auto Loan Payment Calculator",
  description:
    "Estimate a monthly car payment by adjusting price, down payment, loan term, and interest rate. Estimates only; actual terms depend on lender approval.",
  path: "/calculator",
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialPrice = params.price ? Number(params.price) : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Payment Calculator", url: `${BUSINESS.website}/calculator` },
        ]}
      />
      <PageHero
        eyebrow="Tools"
        title="Payment Calculator"
        subtitle="Estimate your monthly payment before you visit. Adjust the numbers to fit your budget."
        compact
      />

      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          <CalculatorForm initialPrice={initialPrice} />
          <div className="mt-8">
            <InlineLeadCTA variant="finance" />
          </div>
        </div>
      </div>
    </>
  );
}
