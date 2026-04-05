"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";

const CONSENT_KEY = "speedway-cookie-consent";

function getConsentSnapshot(): boolean {
  try {
    return !localStorage.getItem(CONSENT_KEY);
  } catch {
    return true;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getConsentSnapshot, getServerSnapshot);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {}
    window.dispatchEvent(new StorageEvent("storage"));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[80] p-4 sm:p-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/8 bg-[#111111]/95 backdrop-blur-md px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-zinc-300 flex-1">
          We use cookies to improve your experience and analyze site traffic.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/privacy-policy"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Read our Privacy Policy
          </Link>
          <button
            onClick={accept}
            className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
