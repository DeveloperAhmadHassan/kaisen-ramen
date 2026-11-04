import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "./site/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Kaisen",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#3d0306",
    theme_color: "#7a0a0e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
