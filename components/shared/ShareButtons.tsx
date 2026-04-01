"use client";

import { useState } from "react";
import { Share2, MessageCircle, Mail, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const smsBody = encodeURIComponent(`Check out this vehicle: ${url}`);
  const emailSubject = encodeURIComponent(`Check out this ${title}`);
  const emailBody = encodeURIComponent(
    `I found this vehicle and thought you might be interested:\n\n${title}\n${url}`
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 mr-1">Share:</span>
      <button
        onClick={copyLink}
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Copy link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
      </button>
      <a
        href={`sms:?body=${smsBody}`}
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Text to a friend"
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </a>
      <a
        href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
        title="Email to a friend"
      >
        <Mail className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
