"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { MOTION_OK, useReveal } from "../sections/reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// placeholder history: replace with the restaurant's real milestones
const MILESTONES = [
  ["The first pot", "A single stockpot, a borrowed stove and a recipe scribbled on a receipt."],
  ["Eight seats", "A counter on a side street. Eight stools, one bowl on the menu, sold out by nine."],
  ["The noodle room", "We stopped buying noodles. A small machine and a lot of flour moved in out back."],
  ["Kara Tori", "A staff meal with too much chili oil became the bowl everyone now asks for."],
  ["Today", "Still simmering overnight. Still pulling noodles every morning. A few more stools."],
];

const VALUES = [
  ["Slow first", "Nothing good in a bowl is hurried. The broth takes eighteen hours, so we start early."],
  ["Made here", "Noodles, tare and toppings are made under our own roof, every single day."],
  ["Served hot", "Ramen waits for nobody. Every bowl leaves the pass within a minute of being built."],
];

/** Our story: words ink themselves in, a noodle draws the timeline, and values stack as you scroll. */
export default function StoryBody() {
  const scope = useRef<HTMLDivElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // the manifesto inks itself in, word by word, as it scrolls through
        const words = SplitText.create(".kr-manifesto", { type: "words" });
        gsap.fromTo(
          words.words,
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: ".kr-manifesto", start: "top 78%", end: "bottom 45%", scrub: 0.6 } },
        );

        // the noodle draws itself down the timeline
        gsap.fromTo(
          ".kr-noodle-line path",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".kr-timeline", start: "top 65%", end: "bottom 65%", scrub: 0.6 } },
        );
        gsap.utils.toArray<HTMLElement>(".kr-mile").forEach((mile, i) => {
          const at = { trigger: mile, start: "top 68%", toggleActions: "play none none reverse" };
          gsap.from(mile.querySelector(".kr-mile-card"), { x: i % 2 ? 70 : -70, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: at });
          gsap.from(mile.querySelector(".kr-mile-dot"), { scale: 0, duration: 0.5, ease: "back.out(3)", scrollTrigger: at });
        });

        // each value card shrinks back as the next one slides over it
        const cards = gsap.utils.toArray<HTMLElement>(".kr-value");
        cards.slice(0, -1).forEach((card, i) => {
          gsap.to(card, {
            scale: 0.92,
            opacity: 0.55,
            ease: "none",
            scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 25%", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope}>
      <section className="kr-sec kr-story kr-pat kr-pat-shippo kr-brush kr-brush-a">
        <div className="kr-wrap">
          <p className="kr-manifesto">
            We believe a great bowl of ramen is a small act of patience. Bones that roll all night. Noodles pulled that
            morning. Everything else is just getting out of the way, and getting it to you while it&apos;s still too hot.
          </p>
        </div>
      </section>

      <section className="kr-sec kr-drinks kr-pat kr-pat-kikko kr-brush kr-brush-c">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            How we got here
          </h2>
          <div className="kr-timeline">
            <svg className="kr-noodle-line" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden>
              <path pathLength={1} d="M20 0C34 60 6 120 20 200S34 340 20 400 6 520 20 600 34 740 20 800 6 920 20 1000" />
            </svg>
            {MILESTONES.map(([title, text], i) => (
              <div key={title} className={`kr-mile${i % 2 ? " is-right" : ""}`}>
                <span className="kr-mile-dot" aria-hidden />
                <div className="kr-mile-card">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="kr-sec kr-values kr-menu kr-pat kr-pat-waves kr-brush kr-brush-b">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            What we won&apos;t change
          </h2>
          <div className="kr-value-stack">
            {VALUES.map(([title, text], i) => (
              <article key={title} className="kr-value" style={{ top: `${110 + i * 26}px` }}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
