"use client";

import { FormEvent, useState, useEffect } from "react";
import { Bell } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_KEY = "speedway-inventory-alert-submitted";

interface InventoryAlertBarProps {
  filters?: Record<string, string | undefined>;
}

export function InventoryAlertBar({ filters }: InventoryAlertBarProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed && status !== "success") return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/inventory-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "inventory-bar",
          filters: filters ? JSON.stringify(filters) : null,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full bg-surface-1 border-b border-white/6 border-l-2 border-l-accent">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-emerald-400">
          <span>✓</span>
          <span>You&apos;ll be notified when matching vehicles arrive</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-1 border-b border-white/6 border-l-2 border-l-accent">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-2.5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-sm text-zinc-300 shrink-0">
            <Bell className="h-4 w-4 text-accent-light" />
            <span>Get notified when new vehicles match your search</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-dark h-9 text-sm rounded-lg max-w-70 w-full"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-4 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-60 shrink-0"
            >
              {status === "loading" ? "..." : "Notify Me"}
            </button>
          </div>
          {status === "error" && (
            <span className="text-xs text-red-400">Enter a valid email</span>
          )}
        </form>
      </div>
    </div>
  );
}
