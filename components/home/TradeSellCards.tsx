import { ArrowRight, ArrowRightLeft, DollarSign } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";

export function TradeSellCards() {
  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Trade In or Sell Your Car"
        subtitle="Upgrade to something new or sell outright — we make it easy either way."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trade card */}
        <AnimateIn variant="left">
          <div className="rounded-2xl border border-zinc-200/80 p-8 md:p-10 bg-gradient-to-br from-zinc-50 to-white hover:shadow-lg hover:border-zinc-300 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
              <ArrowRightLeft className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-display text-zinc-900 mb-3">
              Value Your Trade
            </h3>
            <p className="text-zinc-500 mb-7 leading-relaxed">
              Thinking about upgrading? Get a fair market estimate for your
              current vehicle in minutes. Apply the value toward any car in our
              inventory.
            </p>
            <Button href="/trade" variant="secondary" size="md">
              Get Your Estimate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </AnimateIn>

        {/* Sell card */}
        <AnimateIn variant="right" delay={100}>
          <div className="rounded-2xl border border-zinc-200/80 p-8 md:p-10 bg-gradient-to-br from-zinc-50 to-white hover:shadow-lg hover:border-zinc-300 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-700 to-red-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-display text-zinc-900 mb-3">
              Sell Your Car
            </h3>
            <p className="text-zinc-500 mb-7 leading-relaxed">
              Want to sell without buying? We purchase vehicles directly. Submit
              your details, get an offer, and get paid — no trade required.
            </p>
            <Button href="/sell-your-car" variant="primary" size="md">
              Get an Offer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </AnimateIn>
      </div>
    </SectionWrapper>
  );
}
