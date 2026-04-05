"use client";

import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export function AlertsForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setErrorMessage("");
      const res = await fetch("/api/inventory-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "alerts-page" }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-white/8 bg-surface-2 p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-white mb-2">You&apos;re on the list!</h2>
        <p className="text-sm text-zinc-400">
          We&apos;ll send you updates when new vehicles arrive or prices drop.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-2 p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-accent-light" />
        </div>
        <h2 className="text-xl font-bold text-white">Get Inventory Alerts</h2>
        <p className="text-sm text-zinc-400 mt-2">
          Enter your email and we&apos;ll keep you posted on new arrivals and deals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-dark w-full"
          aria-invalid={status === "error"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-70"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe to Alerts"}
        </button>
        {errorMessage && (
          <p className="text-sm text-red-300" role="alert">{errorMessage}</p>
        )}
      </form>

      <p className="text-[10px] text-zinc-600 text-center mt-4">
        We respect your inbox. Unsubscribe anytime.
      </p>
    </div>
  );
}
