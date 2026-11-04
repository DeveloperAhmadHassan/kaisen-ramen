import Image from "next/image";
import { DROP_CORNERS, box, sizes } from "./artboard";
import BuyNow from "./buy-now";
import { HeroBackdrop, TitleGlow } from "./hero-backdrop";
import HeroIntro from "./hero-intro";
import RamenCarousel from "./ramen-carousel";
import AnchorScroll from "./sections/anchor-scroll";
import BuildBowl from "./sections/build-bowl";
import Footer from "./sections/footer";
import Menu from "./sections/menu";
import Journey from "./sections/journey";
import Story from "./sections/story";
import Ticker from "./sections/ticker";
import Visit from "./sections/visit";
import JsonLd from "./site/json-ld";
import { SITE_DESCRIPTION, menuSchema, pageMeta, restaurantSchema, websiteSchema } from "./site/seo";

// `m` is each pair's box in the portrait frame: pulled into the bottom corners
const art = [
  { src: "/images/chopsticks.png", box: [98, 500, 250], m: [212, 598, 322], w: 1528, h: 1086, className: "kr-chopsticks" },
  { src: "/images/chopsticks-right.png", box: [548, 505, 748], m: [474, 622, 594], w: 1578, h: 789, className: "kr-chopsticks" },
] as const;

export const metadata = pageMeta({ description: SITE_DESCRIPTION, path: "/" });

export default function Home() {
  return (
    <main className="kr-page">
      <JsonLd data={[restaurantSchema(), websiteSchema(), menuSchema()]} />
      <section className="kr-hero" aria-label="Kaisen Ramen">
        <HeroBackdrop />
        <noscript>
          <style>
            {
              ".kr-artboard[data-intro] :is(.kr-board, .kr-bowl, .kr-float, .kr-chopsticks, .kr-cta, .kr-mask-inner, .kr-rule, .kr-dish, .kr-ornament, .kr-nav) { visibility: visible !important; }"
            }
          </style>
        </noscript>
        <div className="kr-artboard" data-intro="pending">
          <TitleGlow />
          <RamenCarousel />

          {art.map((item, i) => (
            <Image
              key={i}
              src={item.src}
              alt=""
              width={item.w}
              height={item.h}
              sizes={sizes(item.box[2] - item.box[0], item.m[2] - item.m[0])}
              loading="eager"
              className={`kr-piece ${item.className}`}
              style={box(item.box[0], item.box[1], item.box[2], item.m, DROP_CORNERS)}
            />
          ))}

          <div className="kr-eyebrow">
            <span className="kr-rule" />
            <span className="kr-mask">
              <span className="kr-mask-inner">Japanese</span>
            </span>
            <span className="kr-rule" />
          </div>

          <h1 className="kr-title">
            <span className="kr-mask">
              <span className="kr-mask-inner">Kaisen</span>
            </span>
            <span className="kr-mask">
              <span className="kr-mask-inner">Ramen</span>
            </span>
          </h1>

          <div className="kr-ornament" aria-hidden>
            <span />
            <i />
            <span />
          </div>

          <BuyNow />
          <HeroIntro />
        </div>
        <Ticker />
      </section>

      <div className="kr-sections">
        <Story />
        <Menu />
        <Journey />
        <BuildBowl />
        <Visit />
        <Footer />
      </div>
      <AnchorScroll />
    </main>
  );
}
