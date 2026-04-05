"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface MobileFilterToggleProps {
  children: React.ReactNode;
}

export function MobileFilterToggle({ children }: MobileFilterToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-surface-1 text-sm font-medium text-zinc-300 hover:bg-surface-2 transition-colors mb-4 w-full justify-center"
      >
        {open ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        {open ? "Hide Filters" : "Show Filters"}
      </button>
      <div className={`${open ? "block" : "hidden"} lg:block`}>
        {children}
      </div>
    </>
  );
}
