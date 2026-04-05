export default function VehicleDetailLoading() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-24">
      <div className="border-b border-white/6">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-3">
          <div className="h-4 w-32 bg-surface-2 rounded animate-pulse" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Image skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="aspect-16/10 rounded-2xl bg-surface-2 animate-pulse" />
            <div className="animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-28 bg-surface-2 rounded-lg" />
                <div className="h-10 w-28 bg-surface-2 rounded-lg" />
                <div className="h-10 w-28 bg-surface-2 rounded-lg" />
              </div>
              <div className="space-y-3 p-6 rounded-2xl border border-white/6 bg-surface-1">
                <div className="h-4 w-full bg-surface-2 rounded" />
                <div className="h-4 w-3/4 bg-surface-2 rounded" />
                <div className="h-4 w-5/6 bg-surface-2 rounded" />
              </div>
            </div>
          </div>

          {/* Right: Pricing card skeleton */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/8 bg-surface-2 p-6 md:p-7 animate-pulse space-y-4">
              <div className="h-7 w-3/4 bg-surface-3 rounded" />
              <div className="h-5 w-1/2 bg-surface-2 rounded" />
              <div className="h-10 w-1/3 bg-surface-3 rounded" />
              <div className="h-4 w-1/4 bg-surface-2 rounded" />
              <div className="space-y-3 pt-4">
                <div className="h-12 w-full bg-surface-3 rounded-xl" />
                <div className="h-12 w-full bg-surface-2 rounded-xl" />
                <div className="h-12 w-full bg-surface-2 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
