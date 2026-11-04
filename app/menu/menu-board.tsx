"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { Stepper } from "../cart/drawer";
import { flyToCart } from "../cart/fly";
import { addToCart, money } from "../cart/store";
import { type Kind, type MenuItem, byKind } from "../data/menu";
import { MOTION_OK, useReveal } from "../sections/reveal";
import Segment from "../site/segment";
import { tilt, tiltHover } from "../site/tilt";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

const TABS = [
  ["ramen", "Ramen"],
  ["sides", "Sides"],
  ["drinks", "Drinks"],
] as const;

function Chili({ on }: { on: boolean }) {
  return (
    <svg className={`kr-chili${on ? " is-on" : ""}`} viewBox="0 0 24 24" aria-hidden>
      <path d="M17 5c2 0 3 1 3 3-1 6-7 12-16 12 6-3 8-8 9-12 0-2 2-3 4-3z" fill="currentColor" />
      <path d="M17 5c0-2 1-3 3-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** One signature bowl: it turns as you scroll past, and its name drifts behind it. */
function Bowl({ item, flip }: { item: MenuItem; flip: boolean }) {
  const [qty, setQty] = useState(1);
  const add = (e: MouseEvent<HTMLButtonElement>) => {
    gsap.fromTo(e.currentTarget, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    flyToCart(e.currentTarget.closest(".kr-mrow")?.querySelector<HTMLImageElement>(".kr-mrow-bowl"), item, qty);
    setQty(1);
  };
  return (
    <article className={`kr-mrow${flip ? " is-flip" : ""}`}>
      <span className="kr-mrow-ghost" aria-hidden>
        {item.name}
      </span>
      <div className="kr-mrow-media">
        <Image src={item.src!} alt={item.name} width={1000} height={1000} sizes="(max-width: 860px) 80vw, 40vw" loading="eager" className="kr-mrow-bowl" />
      </div>
      <div className="kr-mrow-copy" data-reveal="group">
        <p className="kr-mrow-tags">
          {item.tags?.map((t) => (
            <span key={t} className="kr-card-tag">
              {t}
            </span>
          ))}
        </p>
        <h3>{item.name}</h3>
        <p>{item.text}</p>
        <div className="kr-heat" role="img" aria-label={`Heat ${item.heat} of 3`}>
          {[1, 2, 3].map((n) => (
            <Chili key={n} on={n <= (item.heat ?? 0)} />
          ))}
        </div>
        <div className="kr-mrow-buy">
          <span className="kr-price">{money(item.price)}</span>
          <Stepper value={qty} label={item.name} onChange={(n) => setQty(Math.max(1, n))} />
          <button type="button" className="kr-btn" onClick={add}>
            Add to order
          </button>
        </div>
      </div>
    </article>
  );
}

/** The full menu: sticky category tabs, big turning bowls, tilting side cards and a drinks list. */
export default function MenuBoard() {
  const scope = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Kind>("ramen");
  useReveal(scope);

  useGSAP(
    () => {
      // the tab follows whichever category is on screen
      TABS.forEach(([id]) => {
        ScrollTrigger.create({
          trigger: `#menu-${id}`,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(id),
        });
      });
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>(".kr-mrow").forEach((row, i) => {
          const across = { trigger: row, start: "top bottom", end: "bottom top", scrub: 1 };
          gsap.fromTo(row.querySelector(".kr-mrow-bowl"), { rotation: i % 2 ? 80 : -80, scale: 0.8 }, { rotation: i % 2 ? -40 : 40, scale: 1, ease: "none", scrollTrigger: across });
          gsap.fromTo(row.querySelector(".kr-mrow-ghost"), { xPercent: i % 2 ? -14 : 14 }, { xPercent: i % 2 ? 14 : -14, ease: "none", scrollTrigger: across });
          // the chilis pop in one by one
          gsap.from(row.querySelectorAll(".kr-chili"), {
            scale: 0,
            rotation: -60,
            duration: 0.5,
            ease: "back.out(2.5)",
            stagger: 0.1,
            scrollTrigger: { trigger: row, start: "top 65%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  const go = (id: Kind) => {
    setActive(id);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(window, { scrollTo: { y: `#menu-${id}`, offsetY: 130, autoKill: true }, duration: calm ? 0 : 1, ease: "power3.inOut" });
  };

  // a drink row: the ink wipes across under the cursor
  const addDrink = (e: MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    gsap.fromTo(e.currentTarget, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    addToCart(item);
  };

  return (
    <div ref={scope} className="kr-mboard">
      <div className="kr-mtabs">
        <Segment value={active} options={TABS} label="Menu category" onChange={go} />
      </div>

      <section id="menu-ramen" className="kr-sec kr-menu kr-pat kr-pat-waves kr-brush kr-brush-b">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            Ramen
          </h2>
          {byKind("ramen").map((item, i) => (
            <Bowl key={item.id} item={item} flip={i % 2 === 1} />
          ))}
        </div>
      </section>

      <section id="menu-sides" className="kr-sec kr-story kr-pat kr-pat-shippo kr-brush kr-brush-a">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            Sides
          </h2>
          <div className="kr-menu-grid kr-sides" data-reveal="group">
            {byKind("sides").map((item) => (
              <article
                key={item.id}
                className="kr-card"
                onPointerMove={tilt}
                onPointerEnter={(e) => tiltHover(e.currentTarget, true)}
                onPointerLeave={(e) => tiltHover(e.currentTarget, false)}
              >
                <span className="kr-card-glare" aria-hidden />
                <div className="kr-card-media">
                  <Image src={item.src!} alt={item.name} width={item.w} height={item.h} sizes="(max-width: 600px) 80vw, 280px" loading="eager" />
                </div>
                <h3>{item.name}</h3>
                <p>{item.text}</p>
                <div className="kr-card-foot">
                  <span className="kr-price">{money(item.price)}</span>
                  <button
                    type="button"
                    className="kr-add"
                    onClick={(e) => {
                      gsap.fromTo(e.currentTarget, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
                      flyToCart(e.currentTarget.closest(".kr-card")?.querySelector("img"), item);
                    }}
                  >
                    + Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="menu-drinks" className="kr-sec kr-drinks kr-pat kr-pat-kikko kr-brush kr-brush-c">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            Drinks
          </h2>
          <ul className="kr-drink-list" data-reveal="group">
            {byKind("drinks").map((item) => (
              <li key={item.id} className="kr-drink">
                <strong>{item.name}</strong>
                <span>{item.text}</span>
                <em>{money(item.price)}</em>
                <button type="button" className="kr-add" aria-label={`Add ${item.name}`} onClick={(e) => addDrink(e, item)}>
                  + Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
