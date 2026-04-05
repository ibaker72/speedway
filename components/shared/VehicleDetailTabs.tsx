"use client";

import { useState } from "react";
import { CheckCircle, Gauge, Settings2, Fuel, Palette, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Gauge,
  Settings2,
  Fuel,
  Palette,
  Calendar,
};

interface SpecItem {
  iconName: string;
  label: string;
  value: string;
}

interface VehicleDetailTabsProps {
  description?: string;
  specs: SpecItem[];
  features: string[];
}

const TABS = ["Overview", "Specs", "Features"] as const;

export function VehicleDetailTabs({ description, specs, features }: VehicleDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");

  return (
    <div className="rounded-2xl border border-white/6 bg-surface-1 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/6">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-3.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "text-white border-b-2 border-accent bg-white/2"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/2"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 md:p-7">
        {activeTab === "Overview" && (
          <div>
            {description ? (
              <>
                <h2 className="text-lg font-bold text-white mb-3">About This Vehicle</h2>
                <p className="text-zinc-400 leading-relaxed text-[15px]">{description}</p>
              </>
            ) : (
              <p className="text-zinc-500">No description available for this vehicle.</p>
            )}
            {/* Key specs highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/6">
              {specs.slice(0, 4).map((spec) => {
                const Icon = ICON_MAP[spec.iconName] || Gauge;
                return (
                  <div key={spec.label} className="text-center">
                    <Icon className="h-4 w-4 text-zinc-500 mx-auto mb-1" />
                    <p className="text-xs text-zinc-500">{spec.label}</p>
                    <p className="text-sm font-medium text-white">{spec.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "Specs" && (
          <div className="grid grid-cols-2 gap-4">
            {specs.map((spec) => {
              const Icon = ICON_MAP[spec.iconName] || Gauge;
              return (
                <div key={spec.label}>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-0.5">
                    <Icon className="h-3 w-3" />
                    {spec.label}
                  </div>
                  <div className="text-sm font-medium text-white">{spec.value}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "Features" && (
          <div>
            {features.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-zinc-300 bg-white/3 border border-white/4 rounded-lg px-3 py-2.5"
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500">No features listed for this vehicle.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
