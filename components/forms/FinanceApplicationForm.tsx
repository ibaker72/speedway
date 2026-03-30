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
      // TODO: POST to /api/finance-application or integrate with your CRM endpoint
      // await fetch("/api/finance-application", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      console.log("Finance application payload:", payload);
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
      <div className="rounded-2xl bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-zinc-400 text-sm">Our finance team will be in touch within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 space-y-8">
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Step 1 — Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input className="input-dark" name="firstName" placeholder="First Name" required />
            {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <input className="input-dark" name="lastName" placeholder="Last Name" required />
            {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
          </div>
          <div>
            <input className="input-dark" name="email" placeholder="Email Address" type="email" required />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>
          <div>
            <input className="input-dark" name="phone" placeholder="Phone Number" type="tel" required />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Step 2 — Employment & Income</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input-dark" name="employer" placeholder="Employer" />
          <input className="input-dark" name="jobTitle" placeholder="Job Title" />
          <input className="input-dark" name="monthlyIncome" placeholder="Monthly Income" />
          <select className="select-dark" name="residenceStatus" defaultValue="">
            <option value="" disabled>Residence Status</option>
            <option>Own</option>
            <option>Rent</option>
            <option>Living with Family</option>
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Step 3 — Vehicle Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="select-dark" name="vehicleType" defaultValue="">
            <option value="" disabled>Vehicle Type</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Truck</option>
          </select>
          <input className="input-dark" name="downPayment" placeholder="Estimated Down Payment" />
          <input className="input-dark" name="monthlyBudget" placeholder="Estimated Monthly Budget" />
        </div>
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
        <Button type="submit" variant="primary" size="lg" loading={loading} className="rounded-[2px] uppercase tracking-[0.08em]">
          Submit Application
        </Button>
      </div>
    </form>
  );
}
