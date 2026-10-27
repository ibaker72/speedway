export const dealerConfig = {
  // Business
  name: "Speedway Motors LLC",
  shortName: "Speedway Motors",
  slogan: "Speedway — The Only Way",
  phone: "(862) 264-2777",
  phoneHref: "tel:+18622642777",
  fax: "(862) 264-2778",
  email: "info@speedwaymotorsllc.com",
  website: "https://www.speedwaymotorsllc.com",
  established: 2005,
  tagline: "Quality Used Cars in Paterson, NJ",
  description:
    "Speedway Motors LLC is a used car dealership in Paterson, New Jersey, offering quality pre-owned cars, SUVs, trucks, and vans, flexible financing for all credit levels, and competitive trade-in values. Serving Passaic County and surrounding communities since 2005.",

  // Stats — marketing figures shown on the site. The in-stock count is read
  // live from inventory (getLiveInventoryCount), never hardcoded.
  // googleRating / totalReviews must be kept in sync with the Google Business
  // Profile by hand and are never emitted as structured data.
  stats: {
    yearsInBusiness: new Date().getFullYear() - 2005,
    googleRating: 4.8,
    totalReviews: 120,
    customersServed: "5,000+",
    brandsCarried: 20,
  },

  // Locations
  locations: [
    {
      id: "main",
      name: "Main Showroom",
      type: "showroom" as const,
      address: "302-304 22nd Ave",
      city: "Paterson",
      state: "NJ",
      zip: "07513",
    },
  ],

  // Social
  facebook: "https://www.facebook.com/speedwaynj/",
  instagram: "https://www.instagram.com/speedwaymotorsnj/",

  // Theme
  accentColor: "#D31119",
  accentLight: "#ff3a40",

  // Analytics
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,

  // Features (toggle on/off per dealer)
  features: {
    blog: false,
    commercial: true,
    dealDesk: true,
    valueMycar: true,
    geoPages: true,
    // Nationwide shipping inquiries: /nationwide-car-shipping, the homepage
    // promo, and the vehicle-page CTA. Copy is inquiry-based (no prices,
    // transit times, or coverage promises). Set to false to hide every
    // shipping surface if the dealership is not currently arranging shipping.
    nationwideShipping: true,
  },
} as const;
