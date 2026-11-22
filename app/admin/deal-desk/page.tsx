import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLeads } from "@/lib/deal-desk/store";
import { DealDeskDashboard } from "@/components/admin/DealDeskDashboard";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDealDeskPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/admin/login?next=/admin/deal-desk");

  const leads = await listLeads();

  return (
    <AdminShell active="deal-desk">
      <div>
        <h1 className="text-3xl font-bold text-white">Speedway Deal Desk</h1>
        <p className="text-sm text-zinc-400">Internal lead-intent dashboard for sales follow-up. Website form inquiries are under Website Leads.</p>
      </div>
      <DealDeskDashboard leads={leads} />
    </AdminShell>
  );
}
