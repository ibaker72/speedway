import { Search, SlidersHorizontal } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { FeaturedInventory } from "@/components/home/FeaturedInventory";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Inventory",
  description:
    "Browse 180+ quality used cars, SUVs, trucks, and vans at Speedway Motors in Paterson, NJ. Competitive prices and financing available.",
};

export default function InventoryPage() {
  return (
    <>
      <SectionWrapper background="light">
        <SectionHeading
          title="Our Inventory"
          subtitle="Browse 180+ quality pre-owned vehicles ready for you."
          as="h1"
        />

        {/* Search/Filter UI mockup */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by make, model, or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-red-700"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["All", "Sedans", "SUVs", "Trucks", "Vans", "Luxury"].map(
              (filter) => (
                <button
                  key={filter}
                  className="px-4 py-1.5 text-xs font-medium border border-zinc-300 rounded-full text-zinc-700 hover:bg-zinc-100 transition-colors first:bg-zinc-900 first:text-white first:border-zinc-900"
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>
      </SectionWrapper>

      <FeaturedInventory />
    </>
  );
}
