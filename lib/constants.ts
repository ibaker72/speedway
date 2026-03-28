export const BUSINESS = {
  name: "Speedway Motors LLC",
  shortName: "Speedway Motors",
  phone: "(973) 345-2460",
  phoneHref: "tel:+19733452460",
  email: "info@speedwaymotorsnj.com",
  website: "https://speedwaymotorsnj.com",
  established: 2005,
  tagline: "Quality Used Cars in Paterson, NJ",
  description:
    "Speedway Motors LLC is a trusted used car dealership in Paterson, New Jersey, offering quality pre-owned vehicles, flexible financing, and competitive trade-in values.",
  stats: {
    yearsInBusiness: new Date().getFullYear() - 2005,
    vehiclesInStock: 150,
    googleRating: 4.7,
    totalReviews: 380,
    customersServed: "5,000+",
  },
} as const;

export const HOURS = [
  { day: "Monday", open: "9:30 AM", close: "7:00 PM" },
  { day: "Tuesday", open: "9:30 AM", close: "7:00 PM" },
  { day: "Wednesday", open: "9:30 AM", close: "7:00 PM" },
  { day: "Thursday", open: "9:30 AM", close: "7:00 PM" },
  { day: "Friday", open: "9:30 AM", close: "7:00 PM" },
  { day: "Saturday", open: "9:30 AM", close: "7:00 PM" },
  { day: "Sunday", open: "Closed", close: "Closed" },
] as const;

export const NAV_LINKS = [
  { label: "Inventory", href: "/inventory" },
  { label: "Finance", href: "/finance" },
  { label: "Trade-In", href: "/trade" },
  { label: "Sell Your Car", href: "/sell-your-car" },
  { label: "Commercial", href: "/commercial" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
] as const;

export function isOpenNow(): boolean {
  const now = new Date();
  const day = now.getDay();
  if (day === 0) return false; // Sunday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  const openTime = 9 * 60 + 30; // 9:30 AM
  const closeTime = 19 * 60; // 7:00 PM
  return currentTime >= openTime && currentTime < closeTime;
}
