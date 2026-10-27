import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

/**
 * Secondary, low-key prompt on vehicle detail pages. Links to the shipping
 * inquiry form with this vehicle attached via ?vehicle=<slug>.
 */
export function VehicleShippingCta({ slug }: { slug: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-surface-1 p-5">
      <div className="flex items-start gap-3">
        <Truck className="h-5 w-5 text-accent-light shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Interested in this vehicle from out of state? Ask about nationwide shipping.
          </p>
          <Link
            href={`/nationwide-car-shipping?vehicle=${encodeURIComponent(slug)}#shipping-inquiry`}
            data-track-cta="vdp_shipping_inquiry"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light hover:text-white transition-colors"
          >
            Ask about shipping this vehicle
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
