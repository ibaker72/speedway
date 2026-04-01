import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import {
  ClipboardCheck,
  FileSearch,
  CreditCard,
  Handshake,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { BuyingGuideForm } from "./BuyingGuideForm";

export const metadata: Metadata = {
  title: "Free Used Car Buying Guide & Checklist",
  description:
    "Download our free used car buying checklist. Learn what to inspect, how to negotiate, and how to get the best financing — from the experts at Speedway Motors in Paterson, NJ.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/guides/car-buying-guide",
  },
};

const benefits = [
  { icon: ClipboardCheck, title: "15-Point Inspection Checklist", description: "Know exactly what to look for before you buy." },
  { icon: FileSearch, title: "How to Read a Carfax Report", description: "Spot red flags and understand vehicle history." },
  { icon: CreditCard, title: "Financing 101: Credit Scores & Rates", description: "Understand how your credit affects your rate." },
  { icon: Handshake, title: "Negotiation Tips That Actually Work", description: "Proven strategies to get the best price." },
  { icon: AlertTriangle, title: "Hidden Fees to Watch For", description: "Don\u2019t get surprised at the finance office." },
  { icon: TrendingUp, title: "Trade-In Value Maximizer Tips", description: "Get top dollar for your current vehicle." },
];

export default function CarBuyingGuidePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Guides", url: `${BUSINESS.website}/guides/car-buying-guide` },
          { name: "Car Buying Guide", url: `${BUSINESS.website}/guides/car-buying-guide` },
        ]}
      />

      <PageHero
        eyebrow="Free Guide"
        title="The Complete Used Car Buying Checklist"
        subtitle="Everything you need to know before you buy — from inspection tips to financing basics. Free, no strings attached."
      />

      {/* What's Inside */}
      <SectionWrapper background="charcoal">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
            What&apos;s Inside
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="flex items-start gap-4 p-5 rounded-xl bg-surface-1 border border-white/[0.06]">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{b.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>

      {/* Form */}
      <SectionWrapper background="dark">
        <div className="max-w-md mx-auto">
          <BuyingGuideForm />
        </div>
      </SectionWrapper>

      {/* Trust */}
      <SectionWrapper background="elevated">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm text-zinc-400 mb-2">Trusted by {BUSINESS.stats.customersServed} NJ car buyers</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-yellow-400 text-lg">★★★★★</span>
            <span className="text-sm text-zinc-300">{BUSINESS.stats.googleRating} on Google ({BUSINESS.stats.totalReviews}+ reviews)</span>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
