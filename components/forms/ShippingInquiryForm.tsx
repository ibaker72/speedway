"use client";

import { useRef, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { readAttribution, trackLead } from "@/lib/analytics/track";
import {
  SHIPPING_CONSENT_TEXT,
  US_STATES,
  normalizeShippingInquiry,
  validateShippingInquiry,
  type ShippingInquiryErrors,
  type ShippingInquiryField,
} from "@/lib/shipping/inquiry";

export interface ShippingFormVehicle {
  slug: string;
  title: string;
}

const FIELD_ORDER: ShippingInquiryField[] = [
  "name",
  "email",
  "phone",
  "vehicleOfInterest",
  "deliveryZip",
  "deliveryState",
  "message",
  "consent",
];

const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5";
const errorClass = "text-xs text-red-400 mt-1.5";

export function ShippingInquiryForm({ vehicle }: { vehicle?: ShippingFormVehicle | null }) {
  const [errors, setErrors] = useState<ShippingInquiryErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  function focusFirstError(errs: ShippingInquiryErrors) {
    const first = FIELD_ORDER.find((field) => errs[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries()) as Record<string, unknown>;
    const inquiry = normalizeShippingInquiry({ ...raw, consent: formData.get("consent") === "on" });
    const clientErrors = validateShippingInquiry(inquiry);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(clientErrors);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/shipping-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inquiry,
          website: raw.website ?? "",
          attribution: readAttribution(),
          formPage: window.location.pathname,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; errors?: ShippingInquiryErrors };
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
          focusFirstError(data.errors);
        }
        throw new Error(data.message || "Request failed");
      }
      setSubmittedName(inquiry.name.split(" ")[0]);
      setStatus("success");
      trackLead("shipping", { vehicle_slug: inquiry.vehicleSlug || undefined });
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
      <div className="rounded-2xl bg-surface-2 border border-white/8 p-8 text-center py-14" role="status">
        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 animate-check-scale">
          <CheckCircle className="h-8 w-8 text-emerald-400" aria-hidden="true" />
        </div>
        <h3 ref={successRef} tabIndex={-1} className="text-xl font-bold text-white mb-2 outline-none">
          Thanks{submittedName ? `, ${submittedName}` : ""} — we received your shipping inquiry.
        </h3>
        <p className="text-zinc-400 text-sm max-w-md mx-auto">
          A member of our team will follow up by phone or email to talk through the vehicle, purchase steps, and
          shipping options for your location. Need to talk sooner? Call{" "}
          <a href={BUSINESS.phoneHref} className="text-accent-light hover:text-white transition-colors">
            {BUSINESS.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const describedBy = (field: ShippingInquiryField, hint?: string) =>
    [hint, errors[field] ? `shipping-${field}-error` : undefined].filter(Boolean).join(" ") || undefined;

  const fieldError = (field: ShippingInquiryField) =>
    errors[field] ? (
      <p id={`shipping-${field}-error`} className={errorClass}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="shipping-form-title"
      className="rounded-2xl bg-surface-2 border border-white/8 p-6 sm:p-8 space-y-5"
    >
      <div>
        <h3 id="shipping-form-title" className="text-xl font-bold text-white mb-1">
          Request a Shipping Estimate
        </h3>
        <p className="text-sm text-zinc-500">
          Fields marked <span aria-hidden="true">*</span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
        <label htmlFor="shipping-website">Website</label>
        <input id="shipping-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="shipping-name" className={labelClass}>
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            id="shipping-name"
            name="name"
            autoComplete="name"
            className="input-dark"
            required
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={describedBy("name")}
          />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="shipping-email" className={labelClass}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="shipping-email"
            name="email"
            type="email"
            autoComplete="email"
            className="input-dark"
            required
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={describedBy("email")}
          />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor="shipping-phone" className={labelClass}>
            Phone <span aria-hidden="true">*</span>
          </label>
          <input
            id="shipping-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            className="input-dark"
            required
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy("phone")}
          />
          {fieldError("phone")}
        </div>
        <div>
          <label htmlFor="shipping-vehicle" className={labelClass}>
            Vehicle of interest <span aria-hidden="true">*</span>
          </label>
          <input
            id="shipping-vehicle"
            name="vehicleOfInterest"
            className="input-dark"
            defaultValue={vehicle?.title ?? ""}
            placeholder="e.g. 2021 Honda CR-V, or “not sure yet”"
            required
            aria-required="true"
            aria-invalid={!!errors.vehicleOfInterest}
            aria-describedby={describedBy("vehicleOfInterest", vehicle ? "shipping-vehicle-hint" : undefined)}
          />
          {vehicle && (
            <p id="shipping-vehicle-hint" className="text-xs text-zinc-500 mt-1.5">
              We&apos;ll attach this listing to your inquiry.
            </p>
          )}
          {fieldError("vehicleOfInterest")}
          <input type="hidden" name="vehicleSlug" value={vehicle?.slug ?? ""} />
        </div>
        <div>
          <label htmlFor="shipping-zip" className={labelClass}>
            Delivery ZIP code <span aria-hidden="true">*</span>
          </label>
          <input
            id="shipping-zip"
            name="deliveryZip"
            autoComplete="postal-code"
            inputMode="numeric"
            maxLength={10}
            className="input-dark"
            required
            aria-required="true"
            aria-invalid={!!errors.deliveryZip}
            aria-describedby={describedBy("deliveryZip")}
          />
          {fieldError("deliveryZip")}
        </div>
        <div>
          <label htmlFor="shipping-state" className={labelClass}>
            Delivery state <span aria-hidden="true">*</span>
          </label>
          <select
            id="shipping-state"
            name="deliveryState"
            defaultValue=""
            autoComplete="address-level1"
            className="select-dark"
            required
            aria-required="true"
            aria-invalid={!!errors.deliveryState}
            aria-describedby={describedBy("deliveryState")}
          >
            <option value="" disabled>
              Select a state
            </option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          {fieldError("deliveryState")}
        </div>
      </div>

      <div>
        <label htmlFor="shipping-message" className={labelClass}>
          Message <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        <textarea
          id="shipping-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Timing, questions about the vehicle, trade-in, or financing…"
          className="input-dark resize-none"
          aria-invalid={!!errors.message}
          aria-describedby={describedBy("message")}
        />
        {fieldError("message")}
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            id="shipping-consent"
            name="consent"
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-surface-1 accent-[#D31119]"
            required
            aria-required="true"
            aria-invalid={!!errors.consent}
            aria-describedby={describedBy("consent")}
          />
          <label htmlFor="shipping-consent" className="text-sm text-zinc-400 leading-relaxed">
            {SHIPPING_CONSENT_TEXT} See our{" "}
            <a href="/privacy-policy" className="text-accent-light hover:text-white underline decoration-accent/30">
              privacy policy
            </a>
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
        Send Shipping Inquiry
      </Button>
      <p className="text-xs text-zinc-500 text-center">
        No obligation. Shipping estimates depend on the vehicle and destination and are confirmed by our team.
      </p>
    </form>
  );
}
