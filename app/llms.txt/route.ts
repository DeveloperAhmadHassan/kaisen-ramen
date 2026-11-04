import { FAQ } from "../data/faq";
import { type Kind, byKind } from "../data/menu";
import { HOURS } from "../sections/hours";
import { BUSINESS, SITE_DESCRIPTION, SITE_NAME, url } from "../site/seo";

const section = (title: string, kind: Kind) =>
  [`### ${title}`, ...byKind(kind).map((i) => `- ${i.name} ($${i.price.toFixed(2)}): ${i.text}`)].join("\n");

// A plain-text guide to the site for AI assistants (see llmstxt.org), built from
// the same data as the pages, so it can't go stale.
export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Pages

- [Home](${url()}): Signature bowls, regional ramen styles and a build-your-own-bowl tool
- [Menu](${url("/menu")}): Full menu of ramen, sides and drinks with prices
- [Our story](${url("/story")}): How the restaurant started and how the ramen is made
- [Reserve a table](${url("/reserve")}): Book a seat at the counter, a table or a booth
- [Noodle club](${url("/club")}): Loyalty programme: ten bowls earn a free one

## Menu

${section("Ramen", "ramen")}

${section("Sides", "sides")}

${section("Drinks", "drinks")}

## Visit

- Address: ${BUSINESS.street}, ${BUSINESS.locality}
${HOURS.map((h) => `- ${h.label}: ${h.open} to ${h.close}`).join("\n")}
- Walk-ins are welcome; book ahead for groups of six or more.

## FAQ

${FAQ.map(([q, a]) => `- ${q} ${a}`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
