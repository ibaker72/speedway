"use client";

import { useState, FormEvent } from "react";

interface TestDriveFormProps {
  vehicleId: string;
  vehicleTitle: string;
}

type SubmitStatus = "idle" | "loading" | "success";

export function TestDriveForm({ vehicleId, vehicleTitle }: TestDriveFormProps) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("Morning");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    console.log("Test Drive Request:", {
      vehicleId,
      vehicleTitle,
      name,
      phone,
      email,
      preferredDate: date,
      preferredTime: time,
    });
    setTimeout(() => setStatus("success"), 500);
  };

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <div className="text-2xl mb-2">✓</div>
        <p className="text-white font-semibold">Request Submitted!</p>
        <p className="text-sm text-zinc-400 mt-1">
          We&apos;ll contact you to confirm your test drive.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        required
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input-dark w-full"
      />
      <input
        type="tel"
        required
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="input-dark w-full"
      />
      <input
        type="email"
        required
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-dark w-full"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input-dark w-full"
      />
      <select
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="select-dark w-full"
      >
        <option value="Morning">Morning</option>
        <option value="Afternoon">Afternoon</option>
        <option value="Evening">Evening</option>
      </select>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light transition-colors disabled:opacity-70"
      >
        {status === "loading" ? "Submitting..." : "Request Test Drive"}
      </button>
    </form>
  );
}
