import { ArrowRight, ArrowRightLeft, DollarSign } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Button } from "@/components/ui/button";

export function TradeSellCards() {
  return (
    <SectionWrapper background="white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trade card */}
        <div className="rounded-xl border border-zinc-200 p-8 md:p-10 bg-zinc-50">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center mb-5">
            <ArrowRightLeft className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            Value Your Trade
          </h3>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Thinking about upgrading? Get a fair market estimate for your current vehicle in minutes. Apply the value toward any car in our inventory.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button href="/trade" variant="secondary" size="md">
              Get Your Estimate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sell card */}
        <div className="rounded-xl border border-zinc-200 p-8 md:p-10 bg-zinc-50">
          <div className="w-12 h-12 rounded-lg bg-red-700 flex items-center justify-center mb-5">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            Sell Your Car
          </h3>
          <p className="text-zinc-600 mb-6 leading-relaxed">
            Want to sell without buying? We purchase vehicles directly. Submit your details, get an offer, and get paid — no trade required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button href="/sell-your-car" variant="primary" size="md">
              Get an Offer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
