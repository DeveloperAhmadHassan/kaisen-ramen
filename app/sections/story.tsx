"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MOTION_OK, useReveal } from "./reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// placeholder copy: swap in the restaurant's real story and numbers
const STATS = [
  { value: 18, suffix: "h", label: "of simmering in every broth" },
  { value: 4, suffix: "", label: "signature bowls, made daily" },
  { value: 100, suffix: "%", label: "noodles pulled in-house" },
];

/** Our story: the bowl turns and grows as you scroll past; numbers count up. */
export default function Story() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scrub = { trigger: ".kr-story-media", start: "top bottom", end: "bottom top", scrub: 1 };
        gsap.fromTo(".kr-story-ring", { rotation: -40 }, { rotation: 60, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(
          ".kr-story-bowl",
          { rotation: -70, scale: 0.78 },
          { rotation: 40, scale: 1.04, ease: "none", scrollTrigger: scrub },
        );

        // steam wisps drift up and fade, forever
        gsap.utils.toArray<SVGPathElement>(".kr-steam path").forEach((path, i) => {
          gsap.fromTo(
            path,
            { strokeDasharray: "0 1", strokeDashoffset: 0, opacity: 0, y: 20 },
            {
              strokeDasharray: "1 0",
              opacity: 1,
              y: -10,
              duration: 2.4,
              delay: i * 0.6,
              ease: "sine.inOut",
              repeat: -1,
              repeatDelay: 0.6,
              yoyo: true,
            },
          );
        });

        // the numbers count up once they're in view
        gsap.utils.toArray<HTMLElement>(".kr-stat-num").forEach((el) => {
          const n = { v: 0 };
          const target = Number(el.dataset.value);
          const suffix = el.dataset.suffix ?? "";
          gsap.to(n, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => {
              el.textContent = `${Math.round(n.v)}${suffix}`;
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  // the stat cards lift towards the cursor a little
  const lift = (el: HTMLElement, on: boolean) =>
    gsap.to(el, { y: on ? -8 : 0, duration: 0.4, ease: on ? "back.out(2)" : "power2.out" });

  return (
    <section ref={scope} className="kr-sec kr-story kr-pat kr-pat-shippo kr-brush kr-brush-a" id="story">
      <div className="kr-wrap kr-story-grid">
        <div className="kr-story-media">
          <Image
            src="/images/wood-ring.png"
            alt=""
            width={1280}
            height={1280}
            sizes="(max-width: 860px) 90vw, 45vw"
            // eager: the hero shows this same image as its LCP, and a lazy copy trips Next's LCP check
            loading="eager"
            className="kr-story-ring"
          />
          <Image
            src="/images/bowl-left.png"
            alt="A bowl of chashu ramen with soft eggs"
            width={1000}
            height={1000}
            sizes="(max-width: 860px) 70vw, 34vw"
            className="kr-story-bowl"
          />
          <svg className="kr-steam" viewBox="0 0 120 120" aria-hidden>
            <path pathLength={1} d="M30 110c-14-16 14-26 0-44s14-26 0-44" />
            <path pathLength={1} d="M60 112c-14-16 14-26 0-44s14-26 0-44" />
            <path pathLength={1} d="M90 110c-14-16 14-26 0-44s14-26 0-44" />
          </svg>
        </div>

        <div>
          <h2 className="kr-h2" data-reveal="title">
            Slow broth. Quick fire.
          </h2>
          <p className="kr-lede" data-reveal="lines">
            Every bowl starts the night before: bones simmered low until the broth turns silky, tare balanced by
            hand, noodles pulled fresh each morning. Then it all comes together in seconds over a roaring flame,
            the way ramen has been served at counters across Japan for a hundred years.
          </p>
          <div className="kr-stats" data-reveal="group">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="kr-stat"
                onPointerEnter={(e) => lift(e.currentTarget, true)}
                onPointerLeave={(e) => lift(e.currentTarget, false)}
              >
                <span className="kr-stat-num" data-value={s.value} data-suffix={s.suffix}>
                  {s.value}
                  {s.suffix}
                </span>
                <span className="kr-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
