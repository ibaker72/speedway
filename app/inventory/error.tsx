"use client";

import Link from "next/link";

export default function InventoryError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
      <div className="text-center max-w-lg px-5">
        <div className="text-6xl font-bold text-red-500/20 mb-4">Oops</div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Couldn&apos;t load inventory
        </h2>
        <p className="text-zinc-400 mb-8">
          We had trouble loading our vehicles. Please try again in a moment.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-8 py-3.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-light transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/inventory"
            className="px-8 py-3.5 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/6 transition-colors"
          >
            Browse All Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
