"use client";

import { FormEvent, useState } from "react";
import { BellRing } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PriceDropAlertProps {
  slug: string;
  title: string;
  price: number;
}

export function PriceDropAlert({ slug, title, price }: PriceDropAlertProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
          source: "price-drop",
          vehicleSlug: slug,
          vehicleTitle: title,
          currentPrice: price,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.12] p-4">
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <span>✓</span> We&apos;ll email you if the price changes
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-white/[0.12] p-4">
      <div className="flex items-center gap-2 mb-3">
        <BellRing className="h-4 w-4 text-accent-light" />
        <span className="text-sm text-zinc-300">Get alerted if the price drops on this vehicle</span>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-dark h-9 text-sm rounded-lg flex-1"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-3 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-light transition-colors disabled:opacity-60 shrink-0"
        >
          {status === "loading" ? "..." : "Alert Me"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-xs text-red-400 mt-2">Please enter a valid email</p>
      )}
    </div>
  );
}
