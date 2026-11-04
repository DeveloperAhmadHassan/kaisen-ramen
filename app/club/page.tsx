import JsonLd from "../site/json-ld";
import PageHero from "../site/page-hero";
import { breadcrumbSchema, pageMeta } from "../site/seo";
import Shell from "../site/shell";
import ClubBody from "./club-body";

export const metadata = pageMeta({
  title: "Noodle Club",
  description: "Join the Kaisen Ramen noodle club: collect a stamp with every bowl, earn free ramen and get a first taste of new specials.",
  path: "/club",
});

export default function ClubPage() {
  return (
    <Shell>
      <JsonLd data={breadcrumbSchema("Noodle club", "/club")} />
      <PageHero
        title="Noodle club"
        lede="Eat ramen. Collect bowls. Eat free ramen. It's the simplest loyalty card you'll ever carry."
        bowl="/images/bowl-top.png"
        garnish={{ src: "/images/garnish-green-onion.png", w: 793, h: 800 }}
      />
      <ClubBody />
    </Shell>
  );
}
