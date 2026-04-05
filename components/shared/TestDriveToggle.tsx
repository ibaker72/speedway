"use client";

import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { TestDriveForm } from "@/components/forms/TestDriveForm";

interface TestDriveToggleProps {
  vehicleId: string;
  vehicleTitle: string;
}

export function TestDriveToggle({ vehicleId, vehicleTitle }: TestDriveToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/6 bg-surface-1 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-colors"
      >
        <span className="flex items-center gap-3 text-sm font-semibold text-white">
          <Calendar className="h-4 w-4 text-accent-light" />
          Schedule a Test Drive
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-white/4">
          <div className="pt-4">
            <TestDriveForm vehicleId={vehicleId} vehicleTitle={vehicleTitle} />
          </div>
        </div>
      )}
    </div>
  );
}
