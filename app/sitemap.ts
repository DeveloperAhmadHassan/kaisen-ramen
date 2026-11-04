import type { MetadataRoute } from "next";
import { MENU } from "./data/menu";
import { SITE_UPDATED, url } from "./site/seo";

const images = (kind?: string) => MENU.filter((i) => i.src && (!kind || i.kind === kind)).map((i) => url(i.src));

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: url(), lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 1, images: images("ramen") },
    { url: url("/menu"), lastModified: SITE_UPDATED, changeFrequency: "weekly", priority: 0.9, images: images() },
    { url: url("/reserve"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.8 },
    { url: url("/story"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: url("/club"), lastModified: SITE_UPDATED, changeFrequency: "monthly", priority: 0.6 },
  ];
}
