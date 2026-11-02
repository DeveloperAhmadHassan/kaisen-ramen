"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MOTION_OK } from "./reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ROWS = [
  ["Hand-pulled noodles", "Broth simmered 18 hours", "Karaage fried to order", "Open late"],
  ["Tonkotsu", "Shoyu", "Miso", "Tsukimi soba", "Spicy kara tori"],
];

function Bowl() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M3 11h18a9 9 0 0 1-18 0z" fill="currentColor" />
      <path d="M9 8c-1-1.4 1-2.2 0-3.6M13 8c-1-1.4 1-2.2 0-3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Two crossing bands of slogans at the foot of the hero, just below the fold:
 * they sweep in from opposite sides as they scroll into view, then speed up
 * with scrolling and follow its direction.
 */
export default function Ticker() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // each band holds its content twice, so moving it by half loops seamlessly
        const loops = gsap.utils.toArray<HTMLElement>(".kr-ticker-band", scope.current).map((band, i) =>
          gsap.fromTo(
            band,
            { xPercent: i ? -50 : 0 },
            { xPercent: i ? 0 : -50, duration: i ? 34 : 28, ease: "none", repeat: -1 },
          ),
        );
        gsap.from(gsap.utils.toArray(".kr-ticker-row", scope.current), {
          xPercent: (i) => (i ? 110 : -110),
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: scope.current, start: "top 96%", once: true },
        });
        let dir = 1;
        ScrollTrigger.create({
          trigger: scope.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            dir = self.direction;
            const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 250);
            loops.forEach((loop) => {
              gsap.to(loop, { timeScale: dir * boost, duration: 0.2, overwrite: true });
              gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.2, ease: "power2.out" });
            });
          },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="kr-ticker" role="group" aria-label="What we do">
      {ROWS.map((row, r) => (
        <div key={r} className="kr-ticker-row">
          <div className="kr-ticker-band">
            {[0, 1].map((copy) =>
              row.map((text) => (
                <span key={`${copy}-${text}`} className="kr-ticker-item" aria-hidden={copy === 1}>
                  {text}
                  <Bowl />
                </span>
              )),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
