import Link from "next/link";
import { CheckCircle, ExternalLink, Info, ShieldCheck, Truck, Wallet } from "lucide-react";
import { ExpandableText } from "@/components/inventory/vdp/ExpandableText";
import type { FeatureHighlight } from "@/lib/inventory/features";
import type { SpecRow, VehicleOverviewContent } from "@/lib/inventory/vehicle-display";

const card = "rounded-2xl border border-white/6 bg-surface-1 p-5 sm:p-6";

export function VehicleOverviewSection({
  title,
  overview,
  vin,
  historyLinks,
}: {
  title: string;
  overview: VehicleOverviewContent;
  vin: string | null;
  historyLinks: boolean;
}) {
  const length = overview.paragraphs.join(" ").length;
  return (
    <section aria-labelledby="vdp-overview" className={card} data-section="overview">
      <h2 id="vdp-overview" className="text-lg font-bold text-white mb-3">
        Vehicle Overview
      </h2>
      {overview.dealerNote && (
        <p className="mb-3 flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-sm text-zinc-200">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-accent-light" aria-hidden="true" />
          <span>
            <span className="font-semibold">Dealer note:</span> {overview.dealerNote}
          </span>
        </p>
      )}
      <ExpandableText collapse={length > 900}>
        <div className="space-y-3 text-[15px] leading-relaxed text-zinc-300">
          {overview.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </ExpandableText>
      {overview.source === "generated" && (
        <p className="mt-3 text-xs text-zinc-500">
          Summary based on the listing&apos;s data for {title}. Please confirm details with our team.
        </p>
      )}
      {vin && historyLinks && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/6 pt-4 text-sm">
          <a
            href={`https://www.carfax.com/VehicleHistory/p/Report.cfx?vin=${vin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-accent-light"
          >
            <ShieldCheck className="h-4 w-4 text-accent-light" aria-hidden="true" />
            Carfax report
            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a
            href={`https://www.cargurus.com/Cars/link/${vin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-accent-light"
          >
            Check on CarGurus
            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      )}
    </section>
  );
}

export function VehicleSpecsSection({
  rows,
  highlights,
  equipment,
}: {
  rows: SpecRow[];
  highlights: FeatureHighlight[];
  equipment: string[];
}) {
  return (
    <section aria-labelledby="vdp-specs" className={card} data-section="specs">
      <h2 id="vdp-specs" className="text-lg font-bold text-white mb-4">
        Features &amp; Specifications
      </h2>
      {highlights.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">Highlighted features</h3>
          <ul className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {highlights.map((h) => (
              <li key={h.key} className="flex items-center gap-2 text-sm text-zinc-200">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                {h.label}
              </li>
            ))}
          </ul>
        </>
      )}
      <h3 className="text-sm font-semibold text-zinc-400 mb-2">Specifications</h3>
      <dl className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.key} className="flex justify-between gap-4 border-b border-white/6 py-2.5 text-sm">
            <dt className="text-zinc-500">{row.label}</dt>
            <dd className="text-right font-medium text-white break-all sm:break-normal">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-zinc-500">
        Specifications not shown weren&apos;t confirmed by the listing data. Ask us and we&apos;ll check the vehicle.
      </p>
      {equipment.length > 0 && (
        <details className="group mt-5 rounded-xl border border-white/8">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-white">
            All listed equipment ({equipment.length})
            <span aria-hidden="true" className="text-zinc-500 transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <ul className="columns-1 gap-6 px-4 pb-4 text-sm text-zinc-400 sm:columns-2">
            {equipment.map((item) => (
              <li key={item} className="break-inside-avoid py-1">
                {item}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export function VehicleFinanceShippingSection({
  priceForCalculator,
  shippingEnabled,
  children,
}: {
  priceForCalculator: number | null;
  shippingEnabled: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section aria-labelledby="vdp-finance" className="space-y-4" data-section="finance-shipping">
      <h2 id="vdp-finance" className="sr-only">
        Financing and shipping
      </h2>
      <div className={`grid grid-cols-1 gap-4 ${shippingEnabled ? "sm:grid-cols-2" : ""}`}>
        <div className={card}>
          <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-white">
            <Wallet className="h-4 w-4 text-accent-light" aria-hidden="true" />
            Financing
          </h3>
          <p className="text-sm leading-relaxed text-zinc-400">
            We work with lenders for a range of credit situations. Estimate a payment or apply online — approval, rate,
            and terms are decided by the lender.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href="/finance" className="text-accent-light hover:text-white">
              Apply for financing
            </Link>
            {priceForCalculator && (
              <Link href={`/calculator?price=${priceForCalculator}`} className="text-accent-light hover:text-white">
                Payment calculator
              </Link>
            )}
          </div>
        </div>
        {shippingEnabled && (
          <div className={card}>
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-white">
              <Truck className="h-4 w-4 text-accent-light" aria-hidden="true" />
              Nationwide shipping
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Buying from out of state? We can help arrange delivery. Request a quote with your ZIP code and our team
              will reply with options and pricing for your route.
            </p>
            <Link href="/nationwide-car-shipping" className="mt-3 inline-block text-sm font-semibold text-accent-light hover:text-white">
              How shipping works
            </Link>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
