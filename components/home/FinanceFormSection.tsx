"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, Clock, Shield, FileText, Users } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";

const benefits = [
  { icon: CreditCard, text: "All credit levels welcome — good, fair, or rebuilding" },
  { icon: Shield, text: "Competitive rates from trusted NJ lenders" },
  { icon: Clock, text: "Quick decisions — most approvals same day" },
  { icon: FileText, text: "We handle the entire A-to-Z process for you" },
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  creditRange?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return /^[\d\s()+-]{7,}$/.test(phone);
}

export function FinanceFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    if (!form.get("firstName")) errs.firstName = "First name is required";
    if (!form.get("lastName")) errs.lastName = "Last name is required";
    const email = String(form.get("email") || "");
    if (!email) errs.email = "Email is required";
    else if (!validateEmail(email)) errs.email = "Invalid email format";
    const phone = String(form.get("phone") || "");
    if (!phone) errs.phone = "Phone is required";
    else if (!validatePhone(phone)) errs.phone = "Invalid phone format";
    if (!form.get("creditRange")) errs.creditRange = "Please select credit range";
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
    const payload = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      creditRange: formData.get("creditRange"),
      vehicleInterest: formData.get("vehicleInterest"),
    };

    try {
      console.log("Finance application payload:", payload);
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionWrapper background="charcoal">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <AnimateIn variant="left">
          <div>
            <span className="inline-block mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-light">
              Financing
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5">
              Financing Made Simple
            </h2>
            <p className="text-zinc-400 mb-10 leading-relaxed text-lg">
              Don&apos;t let credit hold you back. We work with multiple lenders
              across New Jersey to find the best rate for your situation.
            </p>
            <ul className="space-y-5">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.text} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-accent-light" />
                    </div>
                    <span className="text-zinc-300 leading-relaxed">
                      {b.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </AnimateIn>

        <AnimateIn variant="right" delay={150}>
          <div className="rounded-2xl bg-surface-2 border border-white/[0.08] p-7 sm:p-9 shadow-[0_-2px_24px_-4px_rgba(211,17,25,0.08)]">
            {submitted ? (
              <div className="text-center py-12" role="status" aria-live="polite">
                <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 animate-check-scale">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Thank You!
                </h3>
                <p className="text-zinc-400 text-sm">
                  We&apos;ve received your application. A member of our finance
                  team will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Social proof */}
                <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  <span>Join 5,000+ customers who&apos;ve been approved</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Get Pre-Approved
                </h3>
                <p className="text-xs text-zinc-500 mb-5">
                  No impact to your credit score. Quick and confidential.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      id="hp-firstName"
                      type="text"
                      name="firstName"
                      placeholder=" "
                      required
                      className="input-dark peer pt-5 pb-2"
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? "hp-firstName-error" : undefined}
                    />
                    <label htmlFor="hp-firstName" className="absolute left-[1.125rem] top-1/2 -translate-y-1/2 text-zinc-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-accent-light peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]">
                      First Name
                    </label>
                    {errors.firstName && <p id="hp-firstName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.firstName}</p>}
                  </div>
                  <div className="relative">
                    <input
                      id="hp-lastName"
                      type="text"
                      name="lastName"
                      placeholder=" "
                      required
                      className="input-dark peer pt-5 pb-2"
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? "hp-lastName-error" : undefined}
                    />
                    <label htmlFor="hp-lastName" className="absolute left-[1.125rem] top-1/2 -translate-y-1/2 text-zinc-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-accent-light peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]">
                      Last Name
                    </label>
                    {errors.lastName && <p id="hp-lastName-error" className="text-xs text-red-400 mt-1" role="alert">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="hp-email"
                    type="email"
                    name="email"
                    placeholder=" "
                    required
                    className="input-dark peer pt-5 pb-2"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "hp-email-error" : undefined}
                  />
                  <label htmlFor="hp-email" className="absolute left-[1.125rem] top-1/2 -translate-y-1/2 text-zinc-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-accent-light peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]">
                    Email Address
                  </label>
                  {errors.email && <p id="hp-email-error" className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
                </div>
                <div className="relative">
                  <input
                    id="hp-phone"
                    type="tel"
                    name="phone"
                    placeholder=" "
                    required
                    className="input-dark peer pt-5 pb-2"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "hp-phone-error" : undefined}
                  />
                  <label htmlFor="hp-phone" className="absolute left-[1.125rem] top-1/2 -translate-y-1/2 text-zinc-500 text-sm transition-all duration-200 pointer-events-none peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:text-accent-light peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px]">
                    Phone Number
                  </label>
                  {errors.phone && <p id="hp-phone-error" className="text-xs text-red-400 mt-1" role="alert">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="hp-creditRange" className="sr-only">Credit Range</label>
                  <select
                    id="hp-creditRange"
                    name="creditRange"
                    required
                    defaultValue=""
                    className="select-dark"
                    aria-invalid={!!errors.creditRange}
                    aria-describedby={errors.creditRange ? "hp-creditRange-error" : undefined}
                  >
                    <option value="" disabled>
                      Credit Range
                    </option>
                    <option value="excellent">Excellent (720+)</option>
                    <option value="good">Good (680–719)</option>
                    <option value="fair">Fair (620–679)</option>
                    <option value="rebuilding">Rebuilding (&lt;620)</option>
                    <option value="no-credit">No Credit History</option>
                  </select>
                  {errors.creditRange && <p id="hp-creditRange-error" className="text-xs text-red-400 mt-1" role="alert">{errors.creditRange}</p>}
                </div>
                <div>
                  <label htmlFor="hp-vehicleInterest" className="sr-only">Vehicle Interest</label>
                  <select
                    id="hp-vehicleInterest"
                    name="vehicleInterest"
                    defaultValue=""
                    className="select-dark"
                  >
                    <option value="" disabled>
                      Vehicle Interest
                    </option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV / Crossover</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van / Minivan</option>
                    <option value="luxury">Luxury</option>
                    <option value="unsure">Not Sure Yet</option>
                  </select>
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400" role="alert">
                    {error}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-accent hover:bg-accent-light text-white font-semibold py-3.5 text-sm transition-all duration-300 mt-2 shadow-[0_2px_16px_rgba(196,18,48,0.3)] hover:shadow-[0_4px_24px_rgba(196,18,48,0.45)] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {loading ? "Submitting..." : "Submit Application"}
                  </button>
                  <div className="mt-2 text-[10px] text-zinc-600 text-right shrink-0">
                    <p className="font-medium text-zinc-500">Avg. approval</p>
                    <p>&lt; 24 hrs</p>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-600 text-center mt-3">
                  Your information is secure and will not be shared.
                </p>
              </form>
            )}
          </div>
        </AnimateIn>
      </div>
    </SectionWrapper>
  );
}
