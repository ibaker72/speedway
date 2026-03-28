export interface Location {
  id: string;
  name: string;
  type: "showroom" | "commercial" | "branch";
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneHref: string;
  mapUrl: string;
  coordinates: { lat: number; lng: number };
}

export const locations: Location[] = [
  {
    id: "main",
    name: "Main Showroom",
    type: "showroom",
    address: "302-304 22nd Ave",
    city: "Paterson",
    state: "NJ",
    zip: "07513",
    phone: "(862) 264-2777",
    phoneHref: "tel:+18622642777",
    mapUrl:
      "https://www.google.com/maps/dir/?api=1&destination=302+22nd+Ave+Paterson+NJ+07513",
    coordinates: { lat: 40.9168, lng: -74.1718 },
  },
  {
    id: "commercial",
    name: "Commercial Department",
    type: "commercial",
    address: "198 East Railway Ave",
    city: "Paterson",
    state: "NJ",
    zip: "07503",
    phone: "(862) 264-2777",
    phoneHref: "tel:+18622642777",
    mapUrl:
      "https://www.google.com/maps/dir/?api=1&destination=198+East+Railway+Ave+Paterson+NJ+07503",
    coordinates: { lat: 40.9085, lng: -74.1621 },
  },
  {
    id: "branch",
    name: "Branch Location",
    type: "branch",
    address: "84-88 Illinois Ave",
    city: "Paterson",
    state: "NJ",
    zip: "07503",
    phone: "(862) 264-2777",
    phoneHref: "tel:+18622642777",
    mapUrl:
      "https://www.google.com/maps/dir/?api=1&destination=84+Illinois+Ave+Paterson+NJ+07503",
    coordinates: { lat: 40.9078, lng: -74.1585 },
  },
];
