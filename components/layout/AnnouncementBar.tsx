import { Clock, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 text-xs sm:text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Mon–Sat 9:30 AM – 7:00 PM</span>
        </div>
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center gap-1.5 font-medium text-white hover:text-amber-200 transition-colors"
        >
          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{BUSINESS.phone}</span>
        </a>
      </div>
    </div>
  );
}
