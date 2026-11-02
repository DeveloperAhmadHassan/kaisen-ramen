"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// One seigaiha tile, as set by background-size in hero.css. Moving the layer by
// a whole number of tiles and repeating gives a seamless, endless drift.
const TILE_W = 44;
const TILE_H = 22;
const DRIFT_TILES = 4;

const EMBERS = 26;

/** Moving texture, light and rising embers behind the whole hero. */
export function HeroBackdrop() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".kr-waves", {
          x: -TILE_W * DRIFT_TILES,
          y: -TILE_H * DRIFT_TILES,
          duration: 12,
          ease: "none",
          repeat: -1,
        });

        // two warm patches of light sweeping about, each on its own loop
        gsap.utils.toArray<HTMLElement>(".kr-haze").forEach((el, i) => {
          gsap.to(el, {
            xPercent: i ? -55 : 60,
            yPercent: i ? 40 : -10,
            scale: i ? 1.3 : 0.85,
            opacity: i ? 1 : 0.95,
            duration: i ? 7 : 8.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

        // embers float up from below the fold, sway, flicker and burn out
        const height = scope.current?.offsetHeight ?? window.innerHeight;
        const rand = gsap.utils.random;
        gsap.utils.toArray<HTMLElement>(".kr-ember").forEach((el) => {
          const rise = () => {
            const duration = rand(6, 12);
            gsap.set(el, { left: `${rand(0, 100)}%`, y: 0, x: 0, scale: rand(0.5, 1.4), opacity: 0 });
            const tl = gsap.timeline({ onComplete: rise });
            tl.to(el, { y: -height * rand(0.6, 1.15), duration, ease: "none" }, 0)
              .to(el, { x: rand(-80, 80), duration: duration / 2, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0)
              .to(el, { opacity: rand(0.6, 1), duration: duration * 0.2, ease: "power1.out" }, 0)
              .to(el, { opacity: 0, duration: duration * 0.35, ease: "power1.in" }, duration * 0.65);
          };
          gsap.delayedCall(rand(0, 8), rise);
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="kr-backdrop" aria-hidden>
      <div className="kr-haze kr-haze-a" />
      <div className="kr-haze kr-haze-b" />
      <div className="kr-waves" />
      {Array.from({ length: EMBERS }, (_, i) => (
        <span key={i} className="kr-ember" />
      ))}
    </div>
  );
}

/** The browner glow behind the title; it breathes slowly. */
export function TitleGlow() {
  const glow = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        glow.current,
        { scale: 0.92, opacity: 0.7 },
        { scale: 1.08, opacity: 1, duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1 },
      );
    });
    return () => mm.revert();
  });

  return <div ref={glow} className="kr-glow" aria-hidden />;
}
