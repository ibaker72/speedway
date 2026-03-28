export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  source: "google" | "yelp" | "facebook";
  vehiclePurchased?: string;
}

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Verified Buyer", rating: 5, text: "I'd been searching for months for a clean F-150 Lariat. Zack helped me through the entire process. Reasonable fees, great price, and they handled everything from paperwork to plates within two weeks. Highly recommend.", date: "2025-09-15", source: "google", vehiclePurchased: "2020 Ford F-150 Lariat" },
  { id: "t2", name: "First-Time Buyer", rating: 5, text: "The whole experience felt calm and comfortable, like talking to friends. They listened to what my family needed and placed me in the right car — not just any car. Never felt pressured. Best dealership experience I've ever had.", date: "2025-11-20", source: "google", vehiclePurchased: "2021 Honda CR-V" },
  { id: "t3", name: "Returning Customer", rating: 5, text: "Found a car online, called the dealership, and Brenda sent me extra photos and videos within the hour. Picked it up a few days later — Zach had all the paperwork ready. Painless and actually fun. Old-school customer service.", date: "2026-01-10", source: "google" },
  { id: "t4", name: "Capital One Customer", rating: 5, text: "Called ahead with my Capital One approval and they set up an early appointment. As a mom with kids to pick up, I appreciated their respect for my time. They even helped me upgrade to a newer vehicle with a lower payment.", date: "2025-10-05", source: "google", vehiclePurchased: "2022 Chevrolet Equinox" },
  { id: "t5", name: "Satisfied Customer", rating: 5, text: "Zack, the sales manager, was knowledgeable and honest. No pressure, no gimmicks. Great selection of cars and the whole team was professional. If you want a trustworthy dealership, this is it.", date: "2026-02-18", source: "google", vehiclePurchased: "2021 Jeep Grand Cherokee Limited L" },
  { id: "t6", name: "Happy Customer", rating: 5, text: "Smooth and stress-free from start to finish. Friendly staff, excellent selection, and fair pricing. Adrian and his team were attentive and polite. It's refreshing to find a dealership that still prioritizes service.", date: "2025-12-22", source: "google" },
];
