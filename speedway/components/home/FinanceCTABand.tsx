import { ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinanceCTABand() {
  return (
    <section className="bg-red-700 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2 text-red-200 text-sm font-medium">
              <BadgeCheck className="h-4 w-4" />
              Financing for every situation
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Get Pre-Approved in Minutes
            </h2>
            <p className="mt-2 text-red-100 text-base">
              All credit welcome. Quick application, competitive rates, and a team that works to get you approved.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              href="/finance"
              variant="secondary"
              size="lg"
              className="bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
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
