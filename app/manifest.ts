import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Speedway Motors LLC",
    short_name: "Speedway Motors",
    description: "Quality Used Cars in Paterson, NJ",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#D31119",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
