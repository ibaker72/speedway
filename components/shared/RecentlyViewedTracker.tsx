"use client";

import { useEffect } from "react";
import { saveRecentlyViewed } from "./RecentlyViewed";

interface Props {
  slug: string;
  year: number;
  make: string;
  model: string;
  price: number;
  image?: string;
}

export function RecentlyViewedTracker({ slug, year, make, model, price, image }: Props) {
  useEffect(() => {
    saveRecentlyViewed({ slug, year, make, model, price, image });
  }, [slug, year, make, model, price, image]);

  return null;
}
