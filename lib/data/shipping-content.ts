import type { FaqItem } from "@/lib/seo/schema";

/**
 * Copy for /nationwide-car-shipping. Rules for editing:
 * - No prices, flat rates, "free shipping", transit times, or delivery guarantees.
 * - Do not say Speedway Motors operates its own transport fleet, or that a
 *   third-party carrier is always used, until the dealership confirms how
 *   shipping is arranged. Keep the "ask us who transports the vehicle" framing.
 */

export const SHIPPING_STEPS: { title: string; body: string }[] = [
  {
    title: "Browse available vehicles",
    body: "Search our current inventory online. Listings show the price, mileage, and key specifications, and most include photos.",
  },
  {
    title: "Contact Speedway Motors",
    body: "Call us or send a shipping inquiry about the vehicle you like. Ask questions, request more photos or details, and confirm the vehicle is still available.",
  },
  {
    title: "Discuss purchase and financing options",
    body: "Go over the price, the taxes and fees that apply to your purchase, and whether you plan to pay with cash, your own lender, or financing arranged through our team.",
  },
  {
    title: "Request a shipping estimate",
    body: "Share your delivery ZIP code and timing. Our team will look into transport options for your location and review the estimate with you before anything is booked.",
  },
  {
    title: "Coordinate the purchase and delivery",
    body: "Once you approve the purchase and shipping details, we coordinate the paperwork, payment, and the vehicle's release for transport, and explain what to expect at each step.",
  },
];

export const ESTIMATE_REQUIREMENTS: string[] = [
  "The vehicle you're interested in (a link or stock number helps)",
  "Your delivery ZIP code and state",
  "The type of delivery location — home, business, or another spot you choose (some streets can't fit large transport trucks, so a nearby meeting point may be needed)",
  "When you'd like to receive the vehicle",
  "The best phone number and email to reach you",
];

export const SHIPPING_FAQS: FaqItem[] = [
  {
    question: "Does Speedway Motors ship vehicles nationwide?",
    answer:
      "Ask our team about nationwide shipping options for the vehicle you're interested in. Availability, cost, and timing depend on the vehicle and your delivery location, and we confirm the details with you before anything is booked.",
  },
  {
    question: "How much does it cost to ship a car?",
    answer:
      "Shipping cost depends on factors such as distance, the vehicle's size, the delivery location, and timing, so we don't publish flat rates. Send a shipping inquiry with your delivery ZIP code and we'll follow up with an estimate for your situation.",
  },
  {
    question: "How long does vehicle shipping take?",
    answer:
      "Transit time varies with distance, route, and transport scheduling. Our team will discuss expected timing when we review your estimate; any timing we share is an estimate rather than a guaranteed delivery date.",
  },
  {
    question: "Who transports the vehicle?",
    answer:
      "Transport arrangements can vary by destination. Before you commit, ask us who will transport the vehicle, how it is protected while in transit, and who to contact with questions, so you know who is responsible at each step.",
  },
  {
    question: "Can I finance a vehicle if I live out of state?",
    answer:
      "You can apply for financing online from anywhere. Approval and terms depend on the lender and your credit profile. You can also pay with cash, or ask our team about using financing from your own bank or credit union.",
  },
  {
    question: "How do I title and register a car bought from another state?",
    answer:
      "Title, registration, and sales tax rules are set by the state where you will register the vehicle. Our team will explain which documents you'll receive from us, and your state's motor vehicle agency can confirm the remaining steps.",
  },
  {
    question: "Can I learn more about the vehicle before it ships?",
    answer:
      "Yes. Ask for additional photos, videos, or details about any vehicle before you buy. You can also ask about arranging an independent inspection, or visit our Paterson, NJ showroom if you're able to travel.",
  },
  {
    question: "What should I check when the vehicle is delivered?",
    answer:
      "Inspect the vehicle before signing for it: compare its condition with the listing photos, check the odometer, and note any concerns on the delivery paperwork (often called the bill of lading). Contact our team right away if anything doesn't match what you expected.",
  },
];
