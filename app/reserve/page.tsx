import { FAQ } from "../data/faq";
import JsonLd from "../site/json-ld";
import PageHero from "../site/page-hero";
import { breadcrumbSchema, faqSchema, pageMeta } from "../site/seo";
import Shell from "../site/shell";
import Booking from "./booking";

export const metadata = pageMeta({
  title: "Reserve a Table",
  description: "Book a seat at Kaisen Ramen in under a minute. Choose the counter, a table or a booth. Walk-ins are always welcome.",
  path: "/reserve",
});

export default function ReservePage() {
  return (
    <Shell>
      <JsonLd data={[faqSchema(FAQ), breadcrumbSchema("Reserve a table", "/reserve")]} />
      <PageHero
        title="Save a seat"
        lede="Walk-ins are always welcome, but the counter fills up fast. Grab your spot in under a minute."
        bowl="/images/bowl-right.png"
        garnish={{ src: "/images/garnish-corn.png", w: 800, h: 601 }}
      />
      <Booking />
    </Shell>
  );
}
