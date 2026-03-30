export function VehicleCardSkeleton() {
  return (
    <div className="card-vehicle animate-pulse">
      <div className="aspect-[16/10] bg-surface-2" />
      <div className="p-4 pb-5 space-y-3">
        <div className="h-5 bg-surface-3 rounded w-3/4" />
        <div className="h-4 bg-surface-2 rounded w-1/2" />
        <div className="h-7 bg-surface-3 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-surface-2 rounded-full w-20" />
          <div className="h-6 bg-surface-2 rounded-full w-20" />
          <div className="h-6 bg-surface-2 rounded-full w-16" />
        </div>
        <div className="h-4 bg-surface-2 rounded w-24" />
      </div>
    </div>
  );
}

export function VehicleCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  );
}
