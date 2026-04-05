import Link from "next/link";
import type { InventoryResponse } from "@/lib/types/vehicle";
import { KEY_FEATURE_OPTIONS } from "@/lib/inventory/constants";
import type { InventorySearchParams } from "@/lib/inventory/filter-params";

interface InventoryFiltersSidebarProps {
  params: InventorySearchParams;
  filterOptions: InventoryResponse["filters"];
  current: {
    sortBy: string;
    make?: string;
    model?: string;
    bodyType?: string;
    minYear?: number;
    maxYear?: number;
    minMileage?: number;
    maxMileage?: number;
    features: string[];
  };
}

export function InventoryFiltersSidebar({ params, filterOptions, current }: InventoryFiltersSidebarProps) {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/6 bg-surface-1 p-4">
        <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">Sort By</h3>
        <div className="space-y-0.5">
          {[
            { value: "newest", label: "Newest First" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
            { value: "mileage-asc", label: "Mileage: Low to High" },
            { value: "year-desc", label: "Year: New to Old" },
            { value: "date-added", label: "Recently Added" },
          ].map((opt) => (
            <Link key={opt.value} href={{ pathname: "/inventory", query: { ...params, sort: opt.value, page: undefined } }} className={`block text-sm px-3 py-2 rounded-lg transition-colors ${current.sortBy === opt.value ? "bg-accent/10 text-accent-light font-medium" : "text-zinc-400 hover:bg-white/4 hover:text-white"}`}>
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/6 bg-surface-1 p-4">
        <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">Filters</h3>
        <form action="/inventory" className="space-y-4">
          {params.search && <input type="hidden" name="search" value={String(params.search)} />}
          {params.priceMin && <input type="hidden" name="priceMin" value={String(params.priceMin)} />}
          {params.priceMax && <input type="hidden" name="priceMax" value={String(params.priceMax)} />}
          {params.drivetrain && <input type="hidden" name="drivetrain" value={String(params.drivetrain)} />}
          {params.sort && <input type="hidden" name="sort" value={String(params.sort)} />}

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Make</label>
            <select name="make" defaultValue={current.make || ""} className="select-dark text-sm">
              <option value="">All Makes</option>
              {filterOptions.makes.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Model</label>
            <select name="model" defaultValue={current.model || ""} className="select-dark text-sm">
              <option value="">All Models</option>
              {filterOptions.models.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Body Type</label>
            <select name="type" defaultValue={current.bodyType || ""} className="select-dark text-sm capitalize">
              <option value="">All Body Types</option>
              {filterOptions.bodyTypes.map((bt) => <option key={bt.name} value={bt.name} className="capitalize">{bt.name}</option>)}
            </select>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Year Range</p>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <select name="yearMin" defaultValue={current.minYear || ""} className="select-dark text-xs py-2">
                <option value="">Min Year</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-zinc-600 text-xs">to</span>
              <select name="yearMax" defaultValue={current.maxYear || ""} className="select-dark text-xs py-2">
                <option value="">Max Year</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Mileage Range</p>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <input type="number" min={0} name="mileageMin" defaultValue={current.minMileage} placeholder="Min" className="input-dark text-xs py-2" />
              <span className="text-zinc-600 text-xs">to</span>
              <input type="number" min={0} name="mileageMax" defaultValue={current.maxMileage} placeholder="Max" className="input-dark text-xs py-2" />
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Key Features</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {KEY_FEATURE_OPTIONS.map((feature) => (
                <label key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                  <input type="checkbox" name="feature" value={feature} defaultChecked={current.features.includes(feature)} className="accent-accent h-4 w-4" />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 px-3 py-2 bg-accent/20 text-accent-light rounded-lg text-xs font-semibold hover:bg-accent/30 transition-colors">Apply</button>
            <Link href="/inventory" className="flex-1 text-center px-3 py-2 bg-white/4 text-zinc-300 rounded-lg text-xs font-semibold hover:bg-white/8 transition-colors">Reset</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
