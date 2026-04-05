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

export function FinanceApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    if (!form.get("firstName")) errs.firstName = "Required";
    if (!form.get("lastName")) errs.lastName = "Required";
    const email = String(form.get("email") || "");
    if (!email) errs.email = "Required";
    else if (!validateEmail(email)) errs.email = "Invalid email";
    const phone = String(form.get("phone") || "");
    if (!phone) errs.phone = "Required";
    else if (!validatePhone(phone)) errs.phone = "Invalid phone";
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
      const res = await fetch("/api/finance", {
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
      <div className="rounded-2xl bg-[#1A1A1A] border border-white/[0.06] p-6 sm:p-8 text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 animate-check-scale">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-zinc-400 text-sm">Our finance team will be in touch within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-[#1A1A1A] border border-white/[0.06] p-6 sm:p-8 space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Step 1 — Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fin-firstName" className="sr-only">First Name</label>
            <input id="fin-firstName" className="input-dark" name="firstName" placeholder="First Name" required aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "fin-firstName-error" : undefined} />
            {errors.firstName && <p id="fin-firstName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="fin-lastName" className="sr-only">Last Name</label>
            <input id="fin-lastName" className="input-dark" name="lastName" placeholder="Last Name" required aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "fin-lastName-error" : undefined} />
            {errors.lastName && <p id="fin-lastName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.lastName}</p>}
          </div>
          <div>
            <label htmlFor="fin-email" className="sr-only">Email Address</label>
            <input id="fin-email" className="input-dark" name="email" placeholder="Email Address" type="email" required aria-invalid={!!errors.email} aria-describedby={errors.email ? "fin-email-error" : undefined} />
            {errors.email && <p id="fin-email-error" className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="fin-phone" className="sr-only">Phone Number</label>
            <input id="fin-phone" className="input-dark" name="phone" placeholder="Phone Number" type="tel" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "fin-phone-error" : undefined} />
            {errors.phone && <p id="fin-phone-error" className="text-xs text-red-400 mt-1" role="alert">{errors.phone}</p>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Step 2 — Employment & Income</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fin-employer" className="sr-only">Employer</label>
            <input id="fin-employer" className="input-dark" name="employer" placeholder="Employer" />
          </div>
          <div>
            <label htmlFor="fin-jobTitle" className="sr-only">Job Title</label>
            <input id="fin-jobTitle" className="input-dark" name="jobTitle" placeholder="Job Title" />
          </div>
          <div>
            <label htmlFor="fin-monthlyIncome" className="sr-only">Monthly Income</label>
            <input id="fin-monthlyIncome" className="input-dark" name="monthlyIncome" placeholder="Monthly Income" />
          </div>
          <div>
            <label htmlFor="fin-residenceStatus" className="sr-only">Residence Status</label>
            <select id="fin-residenceStatus" className="select-dark" name="residenceStatus" defaultValue="">
              <option value="" disabled>Residence Status</option>
              <option>Own</option>
              <option>Rent</option>
              <option>Living with Family</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Step 3 — Vehicle Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="fin-vehicleType" className="sr-only">Vehicle Type</label>
            <select id="fin-vehicleType" className="select-dark" name="vehicleType" defaultValue="">
              <option value="" disabled>Vehicle Type</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>Truck</option>
            </select>
          </div>
          <div>
            <label htmlFor="fin-downPayment" className="sr-only">Estimated Down Payment</label>
            <input id="fin-downPayment" className="input-dark" name="downPayment" placeholder="Estimated Down Payment" />
          </div>
          <div>
            <label htmlFor="fin-monthlyBudget" className="sr-only">Estimated Monthly Budget</label>
            <input id="fin-monthlyBudget" className="input-dark" name="monthlyBudget" placeholder="Estimated Monthly Budget" />
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="lg" loading={loading} className="uppercase tracking-[0.08em]">
          Submit Application
        </Button>
      </div>
    </form>
  );
}
