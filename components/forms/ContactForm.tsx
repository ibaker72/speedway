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

export function ContactForm() {
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
    if (phone && !validatePhone(phone)) errs.phone = "Invalid phone format";
    if (!form.get("message")) errs.message = "Message is required";
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
      const res = await fetch("/api/contact", {
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
        <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
        <p className="text-zinc-400 text-sm">We&apos;ll get back to you as soon as possible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl bg-surface-2 border border-white/[0.08] p-6 sm:p-8 space-y-5">
      <h3 className="text-xl font-bold text-white mb-1">Send Us a Message</h3>
      <p className="text-sm text-zinc-500 mb-4">Fill out the form and our team will respond promptly.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="sr-only">Full Name</label>
          <input
            id="contact-name"
            className="input-dark"
            name="name"
            placeholder="Full Name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name && <p id="contact-name-error" className="text-xs text-red-400 mt-1" role="alert">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" className="sr-only">Email Address</label>
          <input
            id="contact-email"
            className="input-dark"
            name="email"
            placeholder="Email Address"
            type="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email && <p id="contact-email-error" className="text-xs text-red-400 mt-1" role="alert">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="contact-phone" className="sr-only">Phone Number</label>
          <input
            id="contact-phone"
            className="input-dark"
            name="phone"
            placeholder="Phone Number (optional)"
            type="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          />
          {errors.phone && <p id="contact-phone-error" className="text-xs text-red-400 mt-1" role="alert">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="contact-subject" className="sr-only">Subject</label>
          <select id="contact-subject" name="subject" defaultValue="" className="select-dark">
            <option value="" disabled>Subject</option>
            <option value="general">General Inquiry</option>
            <option value="test-drive">Schedule Test Drive</option>
            <option value="financing">Financing Question</option>
            <option value="trade-in">Trade-In Inquiry</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="sr-only">Your Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Your Message"
          required
          className="input-dark resize-none"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && <p id="contact-message-error" className="text-xs text-red-400 mt-1" role="alert">{errors.message}</p>}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Send Message
      </Button>
    </form>
  );
}
