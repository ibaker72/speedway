"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const POPUP_SUPPRESS_KEY = "speedway-email-magnet-hidden-until";
const SUPPRESS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function EmailMagnetSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const hiddenUntil = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(POPUP_SUPPRESS_KEY) || "0");
  }, []);

  useEffect(() => {
    if (hiddenUntil > Date.now()) return;

    const openModal = () => {
      setIsOpen(true);
      setHasTriggered(true);
    };

    const timer = window.setTimeout(() => {
      if (!hasTriggered) openModal();
    }, 5000);

    const onScroll = () => {
      if (hasTriggered) return;

      const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScrollable <= 0) return;

      const progress = window.scrollY / maxScrollable;
      if (progress >= 0.3) {
        openModal();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [hasTriggered, hiddenUntil]);

  const suppressPopup = () => {
    localStorage.setItem(
      POPUP_SUPPRESS_KEY,
      String(Date.now() + SUPPRESS_DURATION_MS),
    );
    setIsOpen(false);
  };

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    suppressPopup();
  };

  if (!isOpen) return null;

  return (
    <div
      className="email-magnet-backdrop fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          suppressPopup();
        }
      }}
      role="presentation"
    >
      <div className="email-magnet-modal relative w-full max-w-[540px] rounded-2xl border border-white/15 bg-[#1A1A1A] p-6 sm:p-8">
        <button
          type="button"
          onClick={suppressPopup}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
          aria-label="Close subscription pop-up"
        >
          ×
        </button>

        <h2 className="pr-8 text-2xl font-black tracking-[-0.01em] text-white sm:text-3xl">
          Get First Pick on Fresh Inventory.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
          Sign up for our VIP list to get instant updates on new arrivals and
          exclusive price drops.
        </p>

        <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            className="h-12 w-full rounded-lg border border-white/20 bg-black/40 px-4 text-sm text-white placeholder:text-zinc-500 focus:border-[#D31119] focus:outline-none"
          />
          <button
            type="submit"
            className="h-12 rounded-lg bg-[#D31119] px-6 text-sm font-bold tracking-[0.08em] text-white transition-colors hover:bg-[#ea1d25]"
          >
            SUBSCRIBE
          </button>
        </form>
      </div>
    </div>
  );
}
