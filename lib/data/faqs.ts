import { dealerConfig } from "@/dealer.config";
import type { FaqItem } from "@/lib/seo/schema";

/** An answer is plain text with optional inline links, so the visible FAQ and its JSON-LD share one source. */
export type FaqSegment = string | { href: string; label: string };

export interface RichFaq {
  question: string;
  answer: FaqSegment[];
}

const mainLocation = dealerConfig.locations[0];

const BASE_FAQS: RichFaq[] = [
  {
    question: "What financing options does Speedway Motors offer?",
    answer: [
      "We work with most major banks and lending institutions in NJ to offer affordable financing. We also provide ",
      { href: "/finance", label: "sub-prime financing" },
      " — bad credit, no credit, or first-time buyers are all welcome.",
    ],
  },
  {
    question: "What brands does Speedway Motors carry?",
    answer: [
      "Our inventory changes often and has included Acura, Audi, BMW, Chevrolet, Ford, Honda, Hyundai, INFINITI, Jeep, Mercedes-Benz, Nissan, Ram, Toyota, Volkswagen, and many more. ",
      { href: "/inventory", label: "Browse current inventory" },
      " to see what is available today.",
    ],
  },
  {
    question: "Where is Speedway Motors located?",
    answer: [
      "Our main showroom is at ",
      { href: "/contact", label: `${mainLocation.address}, ${mainLocation.city}, ${mainLocation.state} ${mainLocation.zip}` },
      ". We serve all of Passaic County and surrounding areas throughout New Jersey.",
    ],
  },
  {
    question: "Do you offer vehicle warranties?",
    answer: [
      "Many of our vehicles are eligible for extended service contracts and warranties. Our team will walk you through available coverage options.",
    ],
  },
  {
    question: "Can I sell or trade in my car at Speedway Motors?",
    answer: [
      "Absolutely. We offer competitive trade-in values and also purchase vehicles directly — no trade required. ",
      { href: "/trade", label: "Submit your trade-in details" },
      " or ",
      { href: "/sell-your-car", label: "sell your car directly" },
      " for a quick offer.",
    ],
  },
];

const SHIPPING_FAQ: RichFaq = {
  question: "Can I buy a vehicle from Speedway Motors if I live out of state?",
  answer: [
    "Yes, you can start the process from anywhere. Contact our team about the vehicle you are interested in and ask about ",
    { href: "/nationwide-car-shipping", label: "nationwide vehicle shipping options" },
    ". We will explain how purchase paperwork, payment, and transport would work for your location before you commit.",
  ],
};

export const GENERAL_FAQS: RichFaq[] = dealerConfig.features.nationwideShipping
  ? [...BASE_FAQS, SHIPPING_FAQ]
  : BASE_FAQS;

export function faqAnswerText(answer: FaqSegment[]): string {
  return answer.map((segment) => (typeof segment === "string" ? segment : segment.label)).join("");
}

export function toFaqItems(faqs: RichFaq[]): FaqItem[] {
  return faqs.map((faq) => ({ question: faq.question, answer: faqAnswerText(faq.answer) }));
}
