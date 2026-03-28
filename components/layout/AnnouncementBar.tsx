import { Phone, MapPin } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function AnnouncementBar() {
  return (
    <div className="bg-zinc-950 text-zinc-400 text-[11px] border-b border-white/[0.04]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 flex-shrink-0 text-red-500" />
          <a href="/contact" className="hover:text-white transition-colors font-medium">
            3 Locations
          </a>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden sm:inline text-zinc-500">
            302-304 22nd Ave, Paterson, NJ 07513
          </span>
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center gap-1.5 font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <Phone className="h-3 w-3 flex-shrink-0" />
            Sales: {BUSINESS.phone}
          </a>
          <span className="hidden md:inline text-zinc-500">|</span>
          <span className="hidden md:inline text-zinc-500">
            Fax: {BUSINESS.fax}
          </span>
        </div>
      </div>
    </div>
  );
}
