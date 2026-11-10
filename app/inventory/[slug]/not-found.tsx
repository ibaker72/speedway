import Link from "next/link";
import { Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { getInventory, getMakeSummaries } from "@/lib/data/inventory-source";
import { formatVehiclePrice } from "@/lib/data/vehicles-full";
import { MIN_VEHICLES_FOR_MAKE_PAGE, makePagePath } from "@/lib/inventory/make-pages";
import { vehicleName, vehiclePath } from "@/lib/seo/schema";

/**
 * Shown (with a 404 status and noindex) when a vehicle URL no longer matches
 * an in-stock listing — usually because it sold. Sold vehicles are not
 * redirected to the homepage; the 404 lets search engines drop the URL while
 * visitors (and crawlers) get links to similar, current inventory.
 */
export default async function VehicleNotFound() {
  const [{ vehicles }, makes] = await Promise.all([
    getInventory({ perPage: 4, sortBy: "date-added" }).catch(() => ({ vehicles: [] })),
    getMakeSummaries().catch(() => []),
  ]);
  const makeLinks = makes.filter((m) => m.count >= MIN_VEHICLES_FOR_MAKE_PAGE).slice(0, 6);

  return (
    <div className="bg-[#0a0a0a] min-h-[70vh] px-5 pt-12 pb-16">
      <div className="mx-auto max-w-3xl text-center">
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

        {vehicles.length > 0 && (
          <section aria-labelledby="nf-recent" className="mt-12 text-left">
            <h2 id="nf-recent" className="text-lg font-semibold text-white mb-3">Recently added</h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vehicles.map((v) => (
                <li key={v.id}>
                  <Link href={vehiclePath(v)} className="flex justify-between gap-3 rounded-xl border border-white/8 bg-surface-1 px-4 py-3 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white">
                    <span className="truncate">{vehicleName(v)}</span>
                    <span className="shrink-0 font-semibold text-accent-light">{formatVehiclePrice(v.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {makeLinks.length > 0 && (
          <nav aria-label="Shop by make" className="mt-8 flex flex-wrap justify-center gap-2">
            {makeLinks.map((m) => (
              <Link key={m.slug} href={makePagePath(m.slug)} className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:border-white/25 hover:text-white">
                Used {m.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
