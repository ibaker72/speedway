import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="lg:hidden border-t border-zinc-200 bg-white">
      <nav className="px-4 py-3 space-y-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block px-3 py-2.5 text-base font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-4 space-y-2 border-t border-zinc-100 pt-3">
        <Button href="/finance" variant="primary" size="lg" className="w-full">
          Get Pre-Approved
        </Button>
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 text-sm font-semibold text-zinc-900 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call {BUSINESS.phone}
        </a>
        <a
          href="/contact"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full px-6 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Locations &amp; Hours
        </a>
      </div>
    </div>
  );
}
