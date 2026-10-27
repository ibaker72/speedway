"use client";

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GENERAL_FAQS, type FaqSegment } from "@/lib/data/faqs";

function renderAnswer(answer: FaqSegment[]): ReactNode {
  return answer.map((segment, i) =>
    typeof segment === "string" ? (
      <Fragment key={i}>{segment}</Fragment>
    ) : (
      <Link
        key={i}
        href={segment.href}
        className="text-accent-light hover:text-white transition-colors underline decoration-accent/30"
      >
        {segment.label}
      </Link>
    )
  );
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  id,
}: {
  question: string;
  answer: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <div className="border-b border-white/6 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${id}`}
        id={`faq-button-${id}`}
        className="flex items-center justify-between w-full py-5 md:py-6 text-left gap-4 group"
      >
        <span className="font-semibold text-white group-hover:text-accent-light transition-colors text-[15px]">
          {question}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
            isOpen
              ? "bg-accent/10 rotate-180"
              : "bg-white/4 group-hover:bg-white/8"
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-300 ${
              isOpen ? "text-accent-light" : "text-zinc-500"
            }`}
          />
        </div>
      </button>
      <div
        id={`faq-panel-${id}`}
        role="region"
        aria-labelledby={`faq-button-${id}`}
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] pb-5 md:pb-6" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-sm text-zinc-400 leading-relaxed pr-12">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ headingAs = "h2" }: { headingAs?: "h1" | "h2" }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper background="elevated">
      <SectionHeading
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about buying from Speedway Motors."
        as={headingAs}
      />
      <div className="max-w-3xl mx-auto rounded-2xl border border-white/8 bg-surface-1 p-4 sm:p-6">
        <div className="px-2 sm:px-4">
          {GENERAL_FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={renderAnswer(faq.answer)}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              id={String(i)}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
