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
  {
    id: "t1",
    name: "Michael R.",
    rating: 5,
    text: "Great experience from start to finish. The team was upfront about everything — pricing, vehicle history, financing options. No pressure, no games. Drove away in a beautiful CR-V at a fair price.",
    date: "2025-12-15",
    source: "google",
    vehiclePurchased: "2021 Honda CR-V",
  },
  {
    id: "t2",
    name: "Sandra L.",
    rating: 5,
    text: "As a first-time buyer, I was nervous about the process. Speedway Motors made it easy. They helped me get approved for financing and walked me through every step. Highly recommend.",
    date: "2025-11-28",
    source: "google",
    vehiclePurchased: "2020 Toyota Corolla",
  },
  {
    id: "t3",
    name: "David K.",
    rating: 5,
    text: "I've purchased three vehicles from Speedway Motors over the years. Consistently good inventory, fair deals, and a team that actually listens to what you need. They've earned my repeat business.",
    date: "2026-01-10",
    source: "google",
  },
  {
    id: "t4",
    name: "Priya M.",
    rating: 4,
    text: "Solid selection of SUVs and the trade-in process was straightforward. Got a fair value for my old car and the financing rate was competitive. Would recommend to friends and family.",
    date: "2025-10-05",
    source: "google",
    vehiclePurchased: "2022 Chevrolet Equinox",
  },
  {
    id: "t5",
    name: "James T.",
    rating: 5,
    text: "Needed a work truck quickly for my business. The commercial department had exactly what I needed and got the paperwork done same day. Professional operation all around.",
    date: "2026-02-18",
    source: "google",
    vehiclePurchased: "2021 Ford F-250",
  },
  {
    id: "t6",
    name: "Angela W.",
    rating: 5,
    text: "My credit situation isn't perfect, but Speedway Motors worked with me to find a financing solution. No judgment, just solutions. Driving a reliable car now thanks to their team.",
    date: "2025-09-22",
    source: "google",
    vehiclePurchased: "2019 Nissan Altima",
  },
];
