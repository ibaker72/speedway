import { Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

/**
 * Shown (with a 404 status) when a vehicle URL no longer matches an in-stock
 * listing — usually because it sold. Sold vehicles are not redirected to the
 * homepage; the 404 lets search engines drop the URL while visitors get a
 * clear path to similar inventory.
 */
export default function VehicleNotFound() {
  return (
    <div className="bg-[#0a0a0a] min-h-[70vh] flex items-center justify-center px-5 pt-24 pb-16">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold text-white mb-3">This vehicle is no longer available</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          It may have sold or been removed from our inventory. Browse what&apos;s in stock now, or call us and
          we&apos;ll help you find something similar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href="/inventory" variant="primary" size="lg">
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse Current Inventory
          </Button>
          <Button href={BUSINESS.phoneHref} variant="outline" size="lg">
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {BUSINESS.phone}
          </Button>
        </div>
      </div>
    </div>
  );
}
