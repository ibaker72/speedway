"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white font-sans">
        <div className="text-center max-w-lg px-5">
          <div className="text-7xl font-bold text-red-500/20 mb-4">Error</div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-zinc-400 mb-8">
            We hit an unexpected problem. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="px-8 py-3.5 bg-[#D31119] text-white rounded-xl font-semibold hover:bg-[#ff3a40] transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
