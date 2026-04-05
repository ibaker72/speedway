import { dealerConfig } from "@/dealer.config";

export const BUSINESS = {
  name: dealerConfig.name,
  shortName: dealerConfig.shortName,
  slogan: dealerConfig.slogan,
  phone: dealerConfig.phone,
  phoneHref: dealerConfig.phoneHref,
  fax: dealerConfig.fax,
  email: dealerConfig.email,
  website: dealerConfig.website,
  facebook: dealerConfig.facebook,
  instagram: dealerConfig.instagram,
  established: dealerConfig.established,
  tagline: dealerConfig.tagline,
  description: dealerConfig.description,
  stats: dealerConfig.stats,
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

export interface NavChild {
  label: string;
  href: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Inventory", href: "/inventory" },
  { label: "Financing", href: "/finance" },
  {
    label: "Trade / Sell",
    href: "/trade",
    children: [
      { label: "Value Your Trade", href: "/trade" },
      { label: "Sell Your Car", href: "/sell-your-car" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function isOpenNow(): boolean {
  const now = new Date();
  const day = now.getDay();
  if (day === 0) return false;
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  const openTime = 9 * 60 + 30;
  const closeTime = 19 * 60;
  return currentTime >= openTime && currentTime < closeTime;
}
