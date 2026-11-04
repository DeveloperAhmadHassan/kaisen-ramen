import CtaBand from "../site/cta-band";
import JsonLd from "../site/json-ld";
import PageHero from "../site/page-hero";
import { breadcrumbSchema, menuSchema, pageMeta } from "../site/seo";
import Shell from "../site/shell";
import MenuBoard from "./menu-board";

export const metadata = pageMeta({
  title: "Menu",
  description: "Our full ramen menu: spicy Kara Tori, Miso Tori, Chashu Men and Tsukimi Soba, plus sides and drinks. Order online for pickup or delivery.",
  path: "/menu",
});

export default function MenuPage() {
  return (
    <Shell>
      <JsonLd data={[menuSchema(), breadcrumbSchema("Menu", "/menu")]} />
      <PageHero
        title="The menu"
        lede="Four signature bowls, a handful of sides, and something cold to put out the fire."
        bowl="/images/bowl-main.png"
        garnish={{ src: "/images/chili.png", w: 740, h: 363 }}
      />
      <MenuBoard />
      <CtaBand title="Want it your way?" href="/#build" label="Build your own bowl" />
    </Shell>
  );
}
