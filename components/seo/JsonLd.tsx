export function AutoDealerJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": "https://www.speedwaymotorsllc.com/#organization",
    name: "Speedway Motors LLC",
    legalName: "Speedway Motors LLC",
    url: "https://www.speedwaymotorsllc.com/",
    logo: "https://www.speedwaymotorsllc.com/logo.png",
    image: "https://www.speedwaymotorsllc.com/og-image.jpg",
    description:
      "used car dealership in Paterson, NJ offering 180+ quality pre-owned vehicles, flexible financing for all credit levels, and competitive trade-in values. Serving Passaic County since 2005.",
    telephone: "+1-862-264-2777",
    email: "info@speedwaymotorsllc.com",
    foundingDate: "2005",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 10,
      maxValue: 25,
    },
    currenciesAccepted: "USD",
    paymentAccepted: "Cash, Credit Card, Financing, Bank Transfer",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "302-304 22nd Ave",
      addressLocality: "Paterson",
      addressRegion: "NJ",
      postalCode: "07513",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "40.9168",
      longitude: "-74.1718",
    },
    hasMap: "https://www.google.com/maps?q=302+22nd+Ave,+Paterson,+NJ+07513",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:30",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "00:00",
        closes: "00:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "120",
      bestRating: "5",
      worstRating: "1",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Paterson",
        containedInPlace: { "@type": "State", name: "New Jersey" },
      },
      { "@type": "City", name: "Clifton" },
      { "@type": "City", name: "Passaic" },
      { "@type": "City", name: "Totowa" },
      { "@type": "City", name: "Fair Lawn" },
      { "@type": "City", name: "Hawthorne" },
      { "@type": "City", name: "Wayne" },
      { "@type": "City", name: "Garfield" },
      { "@type": "City", name: "Elmwood Park" },
      { "@type": "City", name: "Saddle Brook" },
      { "@type": "City", name: "Little Falls" },
      { "@type": "City", name: "Woodland Park" },
      { "@type": "City", name: "Haledon" },
      { "@type": "City", name: "Prospect Park" },
      { "@type": "City", name: "North Haledon" },
    ],
    sameAs: [
      "https://www.facebook.com/speedwaynj/",
      "https://www.instagram.com/speedwaymotorsnj/",
    ],
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Used Car Sales" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Auto Financing" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Vehicle Trade-In" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Commercial Vehicle Sales" },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What financing options does Speedway Motors offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We work with most major banks and lending institutions in NJ to offer affordable financing. We also provide sub-prime financing — bad credit, no credit, or first-time buyers are all welcome.",
        },
      },
      {
        "@type": "Question",
        name: "What brands does Speedway Motors carry?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We carry 20+ brands including Acura, Audi, BMW, Chevrolet, Dodge, Ford, Honda, Hyundai, INFINITI, Jeep, Land Rover, Mercedes-Benz, Nissan, Ram, Subaru, Toyota, Volkswagen, and Volvo.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Speedway Motors located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our main showroom is at 302-304 22nd Ave, Paterson, NJ 07513. We serve all of Passaic County and surrounding areas throughout New Jersey.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer vehicle warranties?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Many of our vehicles are eligible for extended service contracts and warranties. Our team will walk you through available coverage options.",
        },
      },
      {
        "@type": "Question",
        name: "Can I sell or trade in my car at Speedway Motors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. We offer competitive trade-in values and also purchase vehicles directly — no trade required. Submit your details for a quick offer.",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
