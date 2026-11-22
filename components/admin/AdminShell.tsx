import Link from "next/link";
import { SignOutButton } from "@/components/admin/SignOutButton";

const NAV = [
  { key: "leads", href: "/admin/leads", label: "Website Leads" },
  { key: "deal-desk", href: "/admin/deal-desk", label: "Deal Desk" },
] as const;

export function AdminShell({ active, children }: { active: (typeof NAV)[number]["key"]; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
      <div className="mx-auto max-w-[85rem] space-y-5">
        <nav aria-label="Staff dashboards" className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active === item.key ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                active === item.key ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-auto">
            <SignOutButton />
          </div>
        </nav>
        {children}
      </div>
    </div>
  );
}
