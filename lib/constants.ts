export const BUSINESS = {
  name: "Speedway Motors LLC",
  shortName: "Speedway Motors",
  slogan: "Speedway — The Only Way",
  phone: "(862) 264-2777",
  phoneHref: "tel:+18622642777",
  fax: "(862) 264-2778",
  email: "Speedwaymotorsnj@gmail.com",
  website: "https://www.speedwaymotorsnj.net",
  facebook: "https://www.facebook.com/speedwaynj/",
  established: 2005,
  tagline: "Quality Used Cars in Paterson, NJ",
  description:
    "Speedway Motors LLC is a trusted used car dealership in Paterson, New Jersey, offering 180+ quality pre-owned vehicles, flexible financing for all credit levels, and competitive trade-in values. Serving Passaic County and surrounding communities since 2005.",
  stats: {
    yearsInBusiness: new Date().getFullYear() - 2005,
    vehiclesInStock: 180,
    googleRating: 4.8,
    totalReviews: 120,
    customersServed: "5,000+",
    brandsCarried: 20,
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
