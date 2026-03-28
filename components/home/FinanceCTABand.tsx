import { ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinanceCTABand() {
  return (
    <section className="bg-zinc-900 border-y border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3 text-red-500 text-sm font-medium">
              <BadgeCheck className="h-4 w-4" />
              <span className="tracking-wide text-xs uppercase">
                Financing for every situation
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Get Pre-Approved in Minutes
            </h2>
            <p className="mt-3 text-zinc-400 text-base leading-relaxed">
              All credit levels welcome. Quick application, competitive rates,
              and a team that works to get you approved.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button href="/finance" variant="primary" size="lg">
              Start Application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
