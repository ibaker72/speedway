import { Clock, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-400 text-xs sm:text-sm border-b border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 flex-shrink-0 text-accent/60" />
          <span>Mon–Sat 9:30 AM – 7:00 PM</span>
        </div>
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center gap-2 font-medium text-white hover:text-accent transition-colors"
        >
          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{BUSINESS.phone}</span>
        </a>
      </div>
    </div>
  );
}
