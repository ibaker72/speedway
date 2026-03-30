"use client";

import { LayoutGrid, List } from "lucide-react";

export function InventoryViewToggle() {
  return (
    <div className="flex items-center gap-1 bg-surface-1 border border-white/[0.06] rounded-lg p-1">
      <button
        type="button"
        className="p-1.5 rounded text-accent-light bg-accent/10"
        aria-label="Grid view"
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="p-1.5 rounded text-zinc-500 hover:text-white transition-colors"
        aria-label="List view"
        title="List view (coming soon)"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
