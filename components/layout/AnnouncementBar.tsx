import { Clock, Phone, MapPin } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function AnnouncementBar() {
  return (
    <div className="bg-zinc-950 text-zinc-400 text-xs border-b border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 flex-shrink-0 text-accent/60" />
            <span>Mon–Sat 9:30 AM – 7:00 PM</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <MapPin className="h-3 w-3 flex-shrink-0 text-accent/60" />
            <span>Paterson, NJ</span>
          </div>
        </div>
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center gap-1.5 font-medium text-zinc-300 hover:text-accent transition-colors"
        >
          <Phone className="h-3 w-3 flex-shrink-0" />
          <span>{BUSINESS.phone}</span>
        </a>
      </div>
    </div>
  );
}
