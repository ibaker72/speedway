"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";

const faqs = [
  {
    question: "What financing options does Speedway Motors offer?",
    answer:
      "We work with most major banks and lending institutions in NJ to offer affordable financing. We also provide sub-prime financing — bad credit, no credit, or first-time buyers are all welcome.",
  },
  {
    question: "What brands does Speedway Motors carry?",
    answer:
      "We carry 20+ brands including Acura, Audi, BMW, Chevrolet, Dodge, Ford, Honda, Hyundai, INFINITI, Jeep, Land Rover, Mercedes-Benz, Nissan, Ram, Subaru, Toyota, Volkswagen, and Volvo.",
  },
  {
    question: "Where is Speedway Motors located?",
    answer:
      "Our main showroom is at 302-304 22nd Ave, Paterson, NJ 07513. We serve all of Passaic County and surrounding areas throughout New Jersey.",
  },
  {
    question: "Do you offer vehicle warranties?",
    answer:
      "Yes. Many of our vehicles are eligible for extended service contracts and warranties. Our team will walk you through available coverage options.",
  },
  {
    question: "Can I sell or trade in my car at Speedway Motors?",
    answer:
      "Absolutely. We offer competitive trade-in values and also purchase vehicles directly — no trade required. Submit your details for a quick offer.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        suppressHydrationWarning
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-5 md:py-6 text-left gap-4 group"
      >
        <span className="font-semibold text-zinc-900 group-hover:text-red-700 transition-colors text-[15px]">
          {question}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isOpen
              ? "bg-accent/10 rotate-180"
              : "bg-zinc-100 group-hover:bg-zinc-200"
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-300 ${
              isOpen ? "text-accent" : "text-zinc-400"
            }`}
          />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] pb-5 md:pb-6" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-zinc-500 leading-relaxed pr-12">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SectionWrapper background="light">
      <SectionHeading
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about buying from Speedway Motors."
      />
      <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-200/80 bg-white p-3 sm:p-6 shadow-sm">
        <div className="px-3 sm:px-4">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
