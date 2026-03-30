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

export function SellCarForm() {
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
      // TODO: POST to /api/sell-your-car or integrate with your CRM endpoint
      console.log("Sell car payload:", payload);
      await new Promise((r) => setTimeout(r, 1000));
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
        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Submission Received!</h3>
        <p className="text-zinc-400 text-sm">We&apos;ll review your vehicle details and get back to you with an offer.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-surface-2 border border-white/[0.08] p-6 sm:p-8 space-y-5">
      <h3 className="text-xl font-bold text-white mb-1">Submit Your Vehicle</h3>
      <p className="text-sm text-zinc-500 mb-4">Fill out the details below and we&apos;ll get back to you with a competitive offer.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input className="input-dark" name="name" placeholder="Full Name" required />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
        </div>
        <div>
          <input className="input-dark" name="phone" placeholder="Phone Number" type="tel" required />
          {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <input className="input-dark" name="email" placeholder="Email Address" type="email" required />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <input className="input-dark" name="year" placeholder="Year" required />
          {errors.year && <p className="text-xs text-red-400 mt-1">{errors.year}</p>}
        </div>
        <div>
          <input className="input-dark" name="make" placeholder="Make" required />
          {errors.make && <p className="text-xs text-red-400 mt-1">{errors.make}</p>}
        </div>
        <div>
          <input className="input-dark" name="model" placeholder="Model" required />
          {errors.model && <p className="text-xs text-red-400 mt-1">{errors.model}</p>}
        </div>
        <div>
          <input className="input-dark" name="mileage" placeholder="Mileage" required />
          {errors.mileage && <p className="text-xs text-red-400 mt-1">{errors.mileage}</p>}
        </div>
      </div>

      <select name="condition" defaultValue="" className="select-dark">
        <option value="" disabled>Condition</option>
        <option value="excellent">Excellent</option>
        <option value="good">Good</option>
        <option value="fair">Fair</option>
        <option value="poor">Poor</option>
      </select>

      <textarea
        name="notes"
        rows={3}
        placeholder="Additional Notes (optional)"
        className="input-dark resize-none"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Get My Offer
      </Button>
    </form>
  );
}
