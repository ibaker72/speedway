import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "images.dealer.com" },
      { protocol: "https", hostname: "pictures.dealer.com" },
      { protocol: "https", hostname: "vehicle-photos-published.vauto.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "**.dealereprocess.com" },
      { protocol: "https", hostname: "**.dealercloud.com" },
      { protocol: "https", hostname: "**.izmo.com" },
    ],
  },
};
export default nextConfig;
