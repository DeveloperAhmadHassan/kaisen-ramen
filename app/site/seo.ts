import type { Metadata } from "next";
import { byKind } from "../data/menu";
import type { Kind } from "../data/menu";
import { HOURS } from "../sections/hours";

// Set NEXT_PUBLIC_SITE_URL to the live domain. Canonicals, the sitemap, social
// images and structured data are all built from it.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : "https://kaisenramen.example")).replace(/\/$/, "");

export const url = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

export const SITE_NAME = "Kaisen Ramen";
export const SITE_TITLE = "Kaisen Ramen | Hand-Pulled Japanese Ramen";
export const SITE_DESCRIPTION =
  "Japanese ramen with broth simmered for 18 hours and noodles pulled fresh every morning. See the menu, build your own bowl, order online or reserve a seat.";

// placeholder address: replace with the restaurant's real details
export const BUSINESS = {
  street: "12 Noodle Lane",
  locality: "Food District",
  country: "US",
};

// bump when page content changes; the sitemap reports it to search engines
export const SITE_UPDATED = "2026-11-04";

/** Page metadata with its canonical URL and matching social tags. */
export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const full = title ? `${title} Â· ${SITE_NAME}` : SITE_TITLE;
  return {
    title: title ?? { absolute: SITE_TITLE },
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: full, description },
  };
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const money = (price: number) => ({ "@type": "Offer", price: price.toFixed(2), priceCurrency: "USD" });

const SECTIONS: [Kind, string][] = [
  ["ramen", "Ramen"],
  ["sides", "Sides"],
  ["drinks", "Drinks"],
];

export function menuSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url("/menu")}#menu`,
    name: `${SITE_NAME} menu`,
    url: url("/menu"),
    inLanguage: "en",
    hasMenuSection: SECTIONS.map(([kind, name]) => ({
      "@type": "MenuSection",
      name,
      hasMenuItem: byKind(kind).map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.text,
        ...(item.src ? { image: url(item.src) } : {}),
        offers: money(item.price),
      })),
    })),
  };
}

export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url()}/#restaurant`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: url(),
    image: url("/opengraph-image.jpg"),
    servesCuisine: ["Japanese", "Ramen"],
    priceRange: "$$",
    acceptsReservations: true,
    menu: url("/menu"),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.locality,
      addressCountry: BUSINESS.country,
    },
    openingHoursSpecification: HOURS.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => DAY_NAMES[d]),
      opens: h.open,
      closes: h.close,
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url()}/#website`,
    name: SITE_NAME,
    url: url(),
    inLanguage: "en",
    publisher: { "@id": `${url()}/#restaurant` },
  };
}

export function breadcrumbSchema(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: url() },
      { "@type": "ListItem", position: 2, name, item: url(path) },
    ],
  };
}

export function faqSchema(faq: readonly (readonly [string, string])[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };
}
