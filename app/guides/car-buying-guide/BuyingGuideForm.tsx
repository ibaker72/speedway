"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BuyingGuideForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string || "").trim();
    const name = (form.get("name") as string || "").trim();
    const phone = (form.get("phone") as string || "").trim();
    const vehicleInterest = (form.get("vehicleInterest") as string || "").trim();

    if (!EMAIL_REGEX.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/inventory-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, vehicleInterest, source: "buying-guide" }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <p className="text-xl font-bold text-white mb-2">✓ Check your inbox!</p>
        <p className="text-sm text-zinc-400 mb-6">Your guide is on the way.</p>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light transition-colors"
        >
          Browse Inventory
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white text-center mb-6">
        Download Your Free Guide
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="guide-name" className="block text-sm text-zinc-400 mb-1">Full Name</label>
          <input id="guide-name" name="name" type="text" required className="input-dark" placeholder="John Doe" />
        </div>
        <div>
          <label htmlFor="guide-email" className="block text-sm text-zinc-400 mb-1">Email</label>
          <input id="guide-email" name="email" type="email" required className="input-dark" placeholder="john@example.com" />
        </div>
        <div>
          <label htmlFor="guide-phone" className="block text-sm text-zinc-400 mb-1">Phone <span className="text-zinc-600">(optional)</span></label>
          <input id="guide-phone" name="phone" type="tel" className="input-dark" placeholder="(555) 123-4567" />
        </div>
        <div>
          <label htmlFor="guide-interest" className="block text-sm text-zinc-400 mb-1">What are you shopping for?</label>
          <select id="guide-interest" name="vehicleInterest" className="select-dark">
            <option value="">Select...</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Not Sure">Not Sure</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full h-12 bg-accent text-white text-sm font-bold uppercase tracking-[0.08em] rounded-xl hover:bg-accent-light transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Sending..." : "Send Me the Guide"}
        </button>
        {errorMsg && <p className="text-sm text-red-400 text-center">{errorMsg}</p>}
        <p className="text-xs text-zinc-500 text-center">
          No spam. Unsubscribe anytime. Your info stays private.
        </p>
      </form>
    </div>
  );
}
