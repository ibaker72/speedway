import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { AlertsForm } from "./AlertsForm";
import { BUSINESS } from "@/lib/constants";
import { Bell, TrendingDown, Sparkles, Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory Alerts",
  description:
    "Sign up for Speedway Motors inventory alerts. Be the first to know about new arrivals, price drops, and exclusive deals.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/alerts",
  },
};

const benefits = [
  {
    icon: Sparkles,
    title: "New Arrivals",
    description: "Be the first to see vehicles as soon as they hit our lot.",
  },
  {
    icon: TrendingDown,
    title: "Price Drops",
    description: "Get notified when vehicles you're watching drop in price.",
  },
  {
    icon: Bell,
    title: "Exclusive Deals",
    description: "Access subscriber-only specials before they go public.",
  },
  {
    icon: Shield,
    title: "No Spam",
    description: "Only meaningful updates. Unsubscribe anytime with one click.",
  },
];

export default function AlertsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Inventory Alerts", url: `${BUSINESS.website}/alerts` },
        ]}
      />
      <PageHero
        eyebrow="Stay Updated"
        title="Inventory Alerts"
        subtitle="Never miss your perfect vehicle. Get notified about new arrivals and price drops."
      />

      <SectionWrapper background="charcoal">
        <div className="max-w-xl mx-auto mb-16">
          <AlertsForm />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <AnimateIn key={b.title} delay={i * 100} variant="up">
                <div className="card-glass p-6 text-center h-full">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{b.title}</h3>
                  <p className="text-sm text-zinc-400">{b.description}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>
    </>
  );
}
