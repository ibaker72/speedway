"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminLoginForm({ next }: { next: string }) {
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
    if (res.status === 429) return setError("Too many attempts. Try again in a few minutes.");
    if (!res.ok) return setError("Incorrect password.");
    router.push(next);
    router.refresh();
  }

  return (
    <form action={onSubmit} className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-2 p-6 space-y-3">
      <h1 className="text-xl font-semibold text-white">Speedway Staff Login</h1>
      <p className="text-sm text-zinc-400">Enter the internal password to open the website leads and Deal Desk dashboards.</p>
      <label htmlFor="admin-password" className="sr-only">
        Password
      </label>
      <input id="admin-password" type="password" name="password" className="input-dark" required placeholder="Password" autoComplete="current-password" />
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={loading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
