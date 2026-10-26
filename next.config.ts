import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["ssh2", "ssh2-sftp-client"],
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
      { protocol: "https", hostname: "**.autofunds.net" },
      { protocol: "http",  hostname: "**.autofunds.net" },
    ],
  },
  async redirects() {
    return [
      // The team page was removed at the dealership's request.
      { source: "/team", destination: "/about", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // The production deployment is also reachable on *.vercel.app (and
        // previews always are). Keep those hosts out of search results so only
        // www.speedwaymotorsllc.com is indexed.
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.+\\.vercel\\.app)" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};
export default nextConfig;
