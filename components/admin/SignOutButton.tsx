"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
    >
      Sign out
    </button>
  );
}
