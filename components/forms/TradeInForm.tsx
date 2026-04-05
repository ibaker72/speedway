"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormErrors {
  [key: string]: string | undefined;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return /^[\d\s()+-]{7,}$/.test(phone);
}

export function TradeInForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    if (!form.get("name")) errs.name = "Name is required";
    const email = String(form.get("email") || "");
    if (!email) errs.email = "Email is required";
    else if (!validateEmail(email)) errs.email = "Invalid email format";
    const phone = String(form.get("phone") || "");
    if (!phone) errs.phone = "Phone is required";
    else if (!validatePhone(phone)) errs.phone = "Invalid phone format";
    if (!form.get("year")) errs.year = "Year is required";
    if (!form.get("make")) errs.make = "Make is required";
    if (!form.get("model")) errs.model = "Model is required";
    if (!form.get("mileage")) errs.mileage = "Mileage is required";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/trade-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Request failed");
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-surface-2 border border-white/[0.08] p-8 text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 animate-check-scale">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-zinc-400 text-sm">We&apos;ll review your vehicle and reach out with an estimate.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-surface-2 border border-white/[0.08] p-6 sm:p-8 space-y-5">
      <h3 className="text-xl font-bold text-white mb-1">Get Your Trade-In Value</h3>
      <p className="text-sm text-zinc-500 mb-4">Tell us about your vehicle and we&apos;ll provide a fair market estimate.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="trade-name" className="sr-only">Full Name</label>
          <input id="trade-name" className="input-dark" name="name" placeholder="Full Name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? "trade-name-error" : undefined} />
          {errors.name && <p id="trade-name-error" className="text-xs text-red-400 mt-1" role="alert">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="trade-phone" className="sr-only">Phone Number</label>
          <input id="trade-phone" className="input-dark" name="phone" placeholder="Phone Number" type="tel" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "trade-phone-error" : undefined} />
          {errors.phone && <p id="trade-phone-error" className="text-xs text-red-400 mt-1" role="alert">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="trade-email" className="sr-only">Email Address</label>
          <input id="trade-email" className="input-dark" name="email" placeholder="Email Address" type="email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? "trade-email-error" : undefined} />
          {errors.email && <p id="trade-email-error" className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="trade-year" className="sr-only">Year</label>
          <input id="trade-year" className="input-dark" name="year" placeholder="Year" required aria-invalid={!!errors.year} aria-describedby={errors.year ? "trade-year-error" : undefined} />
          {errors.year && <p id="trade-year-error" className="text-xs text-red-400 mt-1" role="alert">{errors.year}</p>}
        </div>
        <div>
          <label htmlFor="trade-make" className="sr-only">Make</label>
          <input id="trade-make" className="input-dark" name="make" placeholder="Make" required aria-invalid={!!errors.make} aria-describedby={errors.make ? "trade-make-error" : undefined} />
          {errors.make && <p id="trade-make-error" className="text-xs text-red-400 mt-1" role="alert">{errors.make}</p>}
        </div>
        <div>
          <label htmlFor="trade-model" className="sr-only">Model</label>
          <input id="trade-model" className="input-dark" name="model" placeholder="Model" required aria-invalid={!!errors.model} aria-describedby={errors.model ? "trade-model-error" : undefined} />
          {errors.model && <p id="trade-model-error" className="text-xs text-red-400 mt-1" role="alert">{errors.model}</p>}
        </div>
        <div>
          <label htmlFor="trade-mileage" className="sr-only">Mileage</label>
          <input id="trade-mileage" className="input-dark" name="mileage" placeholder="Mileage" required aria-invalid={!!errors.mileage} aria-describedby={errors.mileage ? "trade-mileage-error" : undefined} />
          {errors.mileage && <p id="trade-mileage-error" className="text-xs text-red-400 mt-1" role="alert">{errors.mileage}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="trade-condition" className="sr-only">Condition</label>
        <select id="trade-condition" name="condition" defaultValue="" className="select-dark">
          <option value="" disabled>Condition</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div>
        <label htmlFor="trade-notes" className="sr-only">Additional Notes</label>
        <textarea
          id="trade-notes"
          name="notes"
          rows={3}
          placeholder="Additional Notes (optional)"
          className="input-dark resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Get My Estimate
      </Button>
    </form>
  );
}
