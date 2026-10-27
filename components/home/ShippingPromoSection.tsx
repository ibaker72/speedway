import { ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Homepage nationwide-shipping promotion. Inquiry-based copy only: no prices,
 * "free shipping", coverage, or transit-time claims.
 */
export function ShippingPromoSection() {
  return (
    <section aria-labelledby="shipping-promo-heading" className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-surface-2 p-6 sm:p-8 md:p-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-accent" aria-hidden="true" />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_20%,rgba(211,17,25,0.10),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex items-start gap-5">
              <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-accent/10 border border-accent/20 items-center justify-center">
                <Truck className="h-6 w-6 text-accent-light" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-accent-light font-semibold">
                  Nationwide Vehicle Shipping
                </p>
                <h2 id="shipping-promo-heading" className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Shop Locally. Buy From Anywhere.
                </h2>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-300 leading-relaxed">
                  Explore quality used vehicles at Speedway Motors and ask our team about nationwide vehicle shipping
                  options.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button href="/inventory" variant="primary" size="lg" data-track-cta="home_shipping_promo_inventory">
                Explore Inventory
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="/nationwide-car-shipping" variant="outline" size="lg" data-track-cta="home_shipping_promo_inquiry">
                Ask About Vehicle Shipping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
