import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.imgix.net" },
      { protocol: "https", hostname: "images.dealer.com" },
      { protocol: "https", hostname: "pictures.dealer.com" },
      { protocol: "https", hostname: "vehicle-photos-published.vauto.com" },
    ],
  },
};
export default nextConfig;
