"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: formData.get("password") }),
    });
    setLoading(false);
    if (!res.ok) return setError("Incorrect password.");
    router.push("/admin/deal-desk");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <form action={onSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-2 p-6 space-y-3">
        <h1 className="text-xl font-semibold text-white">Deal Desk Staff Login</h1>
        <p className="text-sm text-zinc-400">Enter internal password to continue.</p>
        <input type="password" name="password" className="input-dark" required placeholder="Password" />
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        <Button type="submit" loading={loading} className="w-full">Access Dashboard</Button>
      </form>
    </div>
  );
}
