import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { safeAdminRedirect } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Staff Login", robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { next } = await searchParams;
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <AdminLoginForm next={safeAdminRedirect(next)} />
    </div>
  );
}
