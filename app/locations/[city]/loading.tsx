export default function LocationLoading() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-full max-w-2xl bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-72 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
