import { PageHero } from "@/components/shared/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { CalculatorForm } from "./CalculatorForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Calculator",
  description:
    "Estimate your monthly car payment with our free auto loan calculator. Adjust price, down payment, loan term, and interest rate.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/calculator",
  },
};

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
        </div>
      </div>
    </>
  );
}
