import CtaBand from "../site/cta-band";
import JsonLd from "../site/json-ld";
import PageHero from "../site/page-hero";
import { breadcrumbSchema, pageMeta } from "../site/seo";
import Shell from "../site/shell";
import StoryBody from "./story-body";

export const metadata = pageMeta({
  title: "Our Story",
  description: "How Kaisen Ramen went from one stockpot to a full counter: 18-hour broth, noodles pulled every morning and bowls served hot.",
  path: "/story",
});

export default function StoryPage() {
  return (
    <Shell>
      <JsonLd data={breadcrumbSchema("Our story", "/story")} />
      <PageHero
        title="Our story"
        lede="One pot, one obsession, and a queue that started out the door and never really stopped."
        bowl="/images/bowl-left.png"
        garnish={{ src: "/images/garnish-egg-half.png", w: 786, h: 648 }}
      />
      <StoryBody />
      <CtaBand title="Taste the story." href="/menu" label="See the menu" />
    </Shell>
  );
}
