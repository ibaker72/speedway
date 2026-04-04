"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface MobileInventoryFiltersProps {
  children: React.ReactNode;
}

export function MobileInventoryFilters({ children }: MobileInventoryFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.1] bg-surface-1 text-sm font-medium text-zinc-300 hover:bg-surface-2 transition-colors mb-4 w-full justify-center"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      <div className="hidden lg:block">{children}</div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-sm bg-[#0f0f10] border-l border-white/10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Filter Inventory</h2>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/[0.06] text-zinc-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
