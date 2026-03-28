import { ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinanceCTABand() {
  return (
    <section className="relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-800 via-red-700 to-red-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(255,255,255,0.1),_transparent_60%)]" />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3 text-red-200 text-sm font-medium">
              <BadgeCheck className="h-4 w-4" />
              <span className="tracking-wide">Financing for every situation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-white">
              Get Pre-Approved in Minutes
            </h2>
            <p className="mt-3 text-red-100/80 text-base leading-relaxed">
              All credit welcome. Quick application, competitive rates, and a
              team that works to get you approved.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              href="/finance"
              variant="secondary"
              size="lg"
              className="bg-white text-red-700 hover:bg-red-50 hover:text-red-800 shadow-lg shadow-red-900/30"
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
