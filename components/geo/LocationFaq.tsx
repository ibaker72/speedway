import { SectionHeading } from "@/components/shared/SectionHeading";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

export interface LocationFaqItem {
  question: string;
  answer: string;
}

export function LocationFaq({ city, faqs }: { city: string; faqs: LocationFaqItem[] }) {
  return (
    <SectionWrapper background="charcoal">
      <SectionHeading eyebrow="FAQ" title={`Questions from ${city} shoppers`} />
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq) => (
          <article key={faq.question} className="rounded-xl border border-white/8 bg-surface-1 p-5">
            <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
