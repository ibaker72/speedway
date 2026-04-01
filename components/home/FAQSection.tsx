"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";

interface FAQ {
  question: string;
  answer: ReactNode;
}

const faqs: FAQ[] = [
  {
    question: "What financing options does Speedway Motors offer?",
    answer: (
      <>
        We work with most major banks and lending institutions in NJ to offer affordable financing. We also provide{" "}
        <Link href="/finance" className="text-accent-light hover:text-white transition-colors underline decoration-accent/30">
          sub-prime financing
        </Link>{" "}
        — bad credit, no credit, or first-time buyers are all welcome.
      </>
    ),
  },
  {
    question: "What brands does Speedway Motors carry?",
    answer:
      "We carry 20+ brands including Acura, Audi, BMW, Chevrolet, Dodge, Ford, Honda, Hyundai, INFINITI, Jeep, Land Rover, Mercedes-Benz, Nissan, Ram, Subaru, Toyota, Volkswagen, and Volvo.",
  },
  {
    question: "Where is Speedway Motors located?",
    answer: (
      <>
        Our main showroom is at{" "}
        <Link href="/contact" className="text-accent-light hover:text-white transition-colors underline decoration-accent/30">
          302-304 22nd Ave, Paterson, NJ 07513
        </Link>
        . We serve all of Passaic County and surrounding areas throughout New Jersey.
      </>
    ),
  },
  {
    question: "Do you offer vehicle warranties?",
    answer:
      "Yes. Many of our vehicles are eligible for extended service contracts and warranties. Our team will walk you through available coverage options.",
  },
  {
    question: "Can I sell or trade in my car at Speedway Motors?",
    answer: (
      <>
        Absolutely. We offer competitive trade-in values and also purchase vehicles directly — no trade required.{" "}
        <Link href="/trade" className="text-accent-light hover:text-white transition-colors underline decoration-accent/30">
          Submit your trade-in details
        </Link>{" "}
        or{" "}
        <Link href="/sell-your-car" className="text-accent-light hover:text-white transition-colors underline decoration-accent/30">
          sell your car directly
        </Link>{" "}
        for a quick offer.
      </>
    ),
  },
];

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
    <div className="border-b border-white/[0.06] last:border-b-0">
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
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isOpen
              ? "bg-accent/10 rotate-180"
              : "bg-white/[0.04] group-hover:bg-white/[0.08]"
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

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper background="elevated">
      <SectionHeading
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about buying from Speedway Motors."
      />
      <div className="max-w-3xl mx-auto rounded-2xl border border-white/[0.08] bg-surface-1 p-4 sm:p-6">
        <div className="px-2 sm:px-4">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
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
