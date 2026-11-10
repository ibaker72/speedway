"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { readAttribution, trackLead } from "@/lib/analytics/track";
import {
  VEHICLE_INQUIRY_CONSENT_TEXT,
  normalizeVehicleInquiry,
  validateVehicleInquiry,
  type VehicleInquiryErrors,
  type VehicleInquiryField,
  type VehicleInquiryType,
} from "@/lib/leads/vehicle-inquiry";

const FIELD_ORDER: VehicleInquiryField[] = ["name", "email", "phone", "message", "consent"];

const COPY: Record<VehicleInquiryType, { submit: string; messageLabel: string; placeholder: string; intro: string }> = {
  availability: {
    submit: "Check Availability",
    messageLabel: "Anything else? (optional)",
    placeholder: "e.g. I'd like to see it this Saturday.",
    intro: "We'll confirm this vehicle is still available and get back to you.",
  },
  question: {
    submit: "Send Question",
    messageLabel: "Your question",
    placeholder: "Ask about features, history reports, test drives, trade-ins…",
    intro: "Ask us anything about this vehicle.",
  },
  financing: {
    submit: "Request Financing Info",
    messageLabel: "Anything we should know? (optional)",
    placeholder: "e.g. planned down payment, trade-in, or questions about terms.",
    intro: "We'll follow up with financing options for this vehicle. This is not a credit application.",
  },
};

const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const errorClass = "text-xs text-red-400 mt-1.5";

export interface InquiryVehicle {
  slug: string;
  title: string;
}

export function VehicleInquiryForm({ type, vehicle }: { type: VehicleInquiryType; vehicle: InquiryVehicle }) {
  const [errors, setErrors] = useState<VehicleInquiryErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState("");
  const [firstName, setFirstName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const copy = COPY[type];
  const id = (field: string) => `vdp-${type}-${field}`;

  function focusFirstError(errs: VehicleInquiryErrors) {
    const first = FIELD_ORDER.find((field) => errs[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const data = new FormData(event.currentTarget);
    const raw = Object.fromEntries(data.entries()) as Record<string, unknown>;
    const inquiry = normalizeVehicleInquiry({ ...raw, inquiryType: type, vehicleSlug: vehicle.slug, consent: data.get("consent") === "on" });
    const clientErrors = validateVehicleInquiry(inquiry);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(clientErrors);
      if (clientErrors.vehicleSlug || clientErrors.inquiryType) setFormError(`Something went wrong. Please call us at ${BUSINESS.phone}.`);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/vehicle-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inquiry, website: raw.website ?? "", attribution: readAttribution(), formPage: window.location.pathname }),
      });
      const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: VehicleInquiryErrors };
      if (!res.ok) {
        if (body.errors) {
          setErrors(body.errors);
          focusFirstError(body.errors);
        }
        throw new Error(body.message || "Request failed");
      }
      setFirstName(inquiry.name.split(" ")[0]);
      setStatus("success");
      trackLead("vehicle_inquiry", { inquiry_type: type, vehicle_slug: vehicle.slug });
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (err) {
      setStatus("idle");
      setFormError(
        err instanceof Error && err.message !== "Request failed"
          ? err.message
          : `Something went wrong. Please try again or call us at ${BUSINESS.phone}.`
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3" role="status">
        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p ref={successRef} tabIndex={-1} className="text-sm text-zinc-300 outline-none">
          Thanks{firstName ? `, ${firstName}` : ""} — we received your request about the {vehicle.title}. We&apos;ll reply
          by {type === "financing" ? "phone or email" : "email or phone"} soon. Need us sooner? Call{" "}
          <a href={BUSINESS.phoneHref} className="text-accent-light underline-offset-2 hover:underline">
            {BUSINESS.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const describedBy = (field: VehicleInquiryField, hint?: string) =>
    [hint, errors[field] ? id(`${field}-error`) : undefined].filter(Boolean).join(" ") || undefined;
  const fieldError = (field: VehicleInquiryField) =>
    errors[field] ? (
      <p id={id(`${field}-error`)} className={errorClass}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4" aria-describedby={id("intro")}>
      <p id={id("intro")} className="text-sm text-zinc-400">
        {copy.intro} Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={id("name")} className={labelClass}>
            Name <span aria-hidden="true">*</span>
          </label>
          <input id={id("name")} name="name" autoComplete="name" className="input-dark" required aria-required="true" aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor={id("email")} className={labelClass}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input id={id("email")} name="email" type="email" inputMode="email" autoComplete="email" className="input-dark" required aria-required="true" aria-invalid={!!errors.email} aria-describedby={describedBy("email")} />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor={id("phone")} className={labelClass}>
            Phone <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input id={id("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="input-dark" aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} />
          {fieldError("phone")}
        </div>
        <fieldset>
          <legend className={labelClass}>Best way to reach you</legend>
          <div className="flex gap-4 pt-2.5 text-sm text-zinc-300">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="preferredContact" value="email" defaultChecked className="accent-[#D31119]" /> Email
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="preferredContact" value="phone" className="accent-[#D31119]" /> Phone
            </label>
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor={id("message")} className={labelClass}>
          {copy.messageLabel} {type === "question" && <span aria-hidden="true">*</span>}
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={3}
          maxLength={2000}
          placeholder={copy.placeholder}
          className="input-dark resize-y"
          required={type === "question"}
          aria-required={type === "question" || undefined}
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
        />
        {fieldError("message")}
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input id={id("consent")} name="consent" type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-surface-1 accent-[#D31119]" required aria-required="true" aria-invalid={!!errors.consent} aria-describedby={describedBy("consent")} />
          <label htmlFor={id("consent")} className="text-xs text-zinc-400 leading-relaxed">
            {VEHICLE_INQUIRY_CONSENT_TEXT} See our{" "}
            <Link href="/privacy-policy" className="text-accent-light underline decoration-accent/30 hover:text-white">
              privacy policy
            </Link>
            .
          </label>
        </div>
        {fieldError("consent")}
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400" role="alert">
          {formError}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={status === "submitting"} className="w-full">
        {copy.submit}
      </Button>
      {type === "financing" && (
        <p className="text-xs text-zinc-500 text-center">
          Ready to apply? <Link href="/finance" className="text-accent-light hover:text-white">Start a finance application</Link>. Approval and terms are set by the lender.
        </p>
      )}
    </form>
  );
}
