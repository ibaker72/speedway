import { ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinanceCTABand() {
  return (
    <section className="relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,152,26,0.08),_transparent_70%)]" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3 text-accent text-sm font-medium">
              <BadgeCheck className="h-4 w-4" />
              <span className="tracking-wide text-xs uppercase">
                Financing for every situation
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-white">
              Get Pre-Approved in Minutes
            </h2>
            <p className="mt-3 text-zinc-400 text-base leading-relaxed">
              All credit levels welcome. Quick application, competitive rates,
              and a team that works to get you approved.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              href="/finance"
              variant="primary"
              size="lg"
            >
              Start Application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
