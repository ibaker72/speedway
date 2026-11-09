"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Clamps long text on screen while keeping all of it in the DOM (readable by
 * search engines and screen readers). Short content renders unclamped.
 */
export function ExpandableText({ children, collapse }: { children: React.ReactNode; collapse: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (!collapse) return <div>{children}</div>;
  return (
    <div>
      <div id={id} className={expanded ? "" : "relative max-h-72 overflow-hidden"}>
        {children}
        {!expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-surface-1 to-transparent" aria-hidden="true" />}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={id}
        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent-light hover:text-white"
      >
        {expanded ? "Show less" : "Read full description"}
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
    </div>
  );
}
