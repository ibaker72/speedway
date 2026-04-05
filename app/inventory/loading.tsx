import { VehicleCardSkeletonGrid } from "@/components/shared/VehicleCardSkeleton";

export default function InventoryLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="relative overflow-hidden text-white py-12 md:py-20">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-surface-3 rounded" />
            <div className="h-12 w-72 bg-surface-3 rounded" />
            <div className="h-5 w-64 bg-surface-2 rounded" />
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar skeleton */}
            <aside className="w-full lg:w-60 shrink-0">
              <div className="space-y-5 animate-pulse">
                <div className="rounded-xl border border-white/6 bg-surface-1 p-4 space-y-3">
                  <div className="h-3 w-16 bg-surface-3 rounded" />
                  <div className="h-8 w-full bg-surface-2 rounded" />
                  <div className="h-8 w-full bg-surface-2 rounded" />
                  <div className="h-8 w-full bg-surface-2 rounded" />
                </div>
                <div className="rounded-xl border border-white/6 bg-surface-1 p-4 space-y-3">
                  <div className="h-3 w-12 bg-surface-3 rounded" />
                  <div className="h-8 w-full bg-surface-2 rounded" />
                  <div className="h-8 w-full bg-surface-2 rounded" />
                </div>
              </div>
            </aside>

            {/* Vehicle grid skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="h-4 w-40 bg-surface-2 rounded animate-pulse" />
              </div>
              <VehicleCardSkeletonGrid count={6} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
