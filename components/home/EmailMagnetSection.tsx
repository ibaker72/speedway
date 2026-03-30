"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const POPUP_SUPPRESS_KEY = "speedway-email-magnet-hidden-until";
const SESSION_SUPPRESS_KEY = "speedway-email-magnet-session-dismissed";
const SUPPRESS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function EmailMagnetSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const suppressFor7Days = useCallback(() => {
    localStorage.setItem(
      POPUP_SUPPRESS_KEY,
      String(Date.now() + SUPPRESS_DURATION_MS),
    );
    sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
  }, []);

  const closeModal = useCallback(() => {
    suppressFor7Days();
    setIsOpen(false);
  }, [suppressFor7Days]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hiddenUntil = Number(localStorage.getItem(POPUP_SUPPRESS_KEY) || "0");
    const hiddenInSession = sessionStorage.getItem(SESSION_SUPPRESS_KEY) === "1";
    if (hiddenUntil > Date.now() || hiddenInSession) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    const openModal = () => {
      if (hasTriggered) return;
      setHasTriggered(true);
      setIsOpen(true);
    };

    const timer = window.setTimeout(openModal, 7000);

    const onScroll = () => {
      if (hasTriggered) return;
      const scrolledPast = window.scrollY > Math.max(window.innerHeight * 0.65, 420);
      if (scrolledPast) {
        openModal();
      }
    };

    const onMouseLeave = (event: MouseEvent) => {
      if (!isDesktop || hasTriggered) return;
      if (event.clientY <= 0) {
        openModal();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (isDesktop) {
      document.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [hasTriggered]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      emailInputRef.current?.focus();
    }, 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) return;

      const focusables = containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeModal]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Enter a valid email address.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");

      const response = await fetch("/api/inventory-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-modal" }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "We couldn't save your email right now.");
      }

      setStatus("success");
      suppressFor7Days();
      window.setTimeout(() => setIsOpen(false), 1200);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="email-magnet-backdrop fixed inset-0 z-[90] flex items-center justify-center px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-alert-title"
        aria-describedby="inventory-alert-description"
        className="email-magnet-modal relative w-full max-w-[35rem] overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(170deg,rgba(35,35,35,0.92),rgba(16,16,16,0.95))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.62)] sm:p-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
          aria-label="Close inventory alerts pop-up"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-light">
          Speedway Insider List
        </p>
        <h2 id="inventory-alert-title" className="mt-3 pr-8 text-2xl font-extrabold tracking-[-0.015em] text-white sm:text-[2rem]">
          Get first access to fresh inventory.
        </h2>
        <p id="inventory-alert-description" className="mt-3 max-w-[50ch] text-sm leading-relaxed text-zinc-300 sm:text-[0.96rem]">
          Be the first to see new arrivals and notable price drops across our premium lineup. No spam—just meaningful updates from {BUSINESS.shortName}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            ref={emailInputRef}
            id="newsletter-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="input-dark h-12 rounded-xl border-white/20 bg-black/35"
            aria-invalid={status === "error"}
            aria-describedby={errorMessage ? "newsletter-error" : "newsletter-trust"}
          />

          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? "Saving..." : status === "success" ? "You're on the list" : "Notify Me"}
          </button>

          {errorMessage ? (
            <p id="newsletter-error" className="text-sm text-red-300" role="alert">
              {errorMessage}
            </p>
          ) : (
            <p id="newsletter-trust" className="text-xs text-zinc-400">
              We respect your inbox. Unsubscribe anytime.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
