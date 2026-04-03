import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLeads } from "@/lib/deal-desk/store";
import { DealDeskDashboard } from "@/components/admin/DealDeskDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDealDeskPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect("/admin/login?next=/admin/deal-desk");

  const leads = await listLeads();

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 pb-10">
      <div className="mx-auto max-w-[85rem] space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-white">Speedway Deal Desk</h1>
          <p className="text-sm text-zinc-400">Internal lead-intent dashboard for sales follow-up.</p>
        </div>
        <DealDeskDashboard leads={leads} />
      </div>
    </div>
  );
}
