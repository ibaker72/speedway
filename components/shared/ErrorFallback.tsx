"use client";

import Link from "next/link";
import { Phone, RotateCw } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

interface ErrorFallbackProps {
  title: string;
  message: string;
  /** Re-fetches and re-renders the failed segment (error.tsx `unstable_retry`). */
  retry: () => void;
  backHref?: string;
  backLabel?: string;
}

/**
 * Shown when a page's data could not be loaded (e.g. the inventory database
 * did not answer after retries). Offers a real retry plus the phone number,
 * so a shopper is never left with a dead end.
 */
export function ErrorFallback({ title, message, retry, backHref = "/inventory", backLabel = "Browse All Inventory" }: ErrorFallbackProps) {
  return (
    <div className="bg-[#0a0a0a] min-h-[70vh] flex items-center justify-center px-4 py-16" role="alert">
      <div className="text-center max-w-lg">
        <div className="text-6xl font-bold text-red-500/20 mb-4" aria-hidden="true">
          Oops
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-zinc-400 mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 bg-[#D31119] text-white rounded-xl font-semibold hover:bg-[#ff3a40] transition-colors"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3.5 border border-white/15 text-white rounded-xl font-semibold hover:bg-white/6 transition-colors"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Call {BUSINESS.phone}
          </a>
        </div>
        <Link href={backHref} className="mt-6 inline-block text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
