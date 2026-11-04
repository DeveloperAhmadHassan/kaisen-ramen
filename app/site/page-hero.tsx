"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { HeroBackdrop } from "../hero-backdrop";
import { afterCurtain } from "../reload";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

type Pic = { src: string; w: number; h: number };

/**
 * The top of every inner page, in the hero's language: same red, waves and
 * embers. The title rises out of its lines and the bowl spins up from nothing
 * (after the reload curtain, if there is one); scrolling keeps the bowl turning.
 */
export default function PageHero({ title, lede, bowl, garnish }: { title: string; lede: string; bowl: string; garnish?: Pic }) {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = scope.current!;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".kr-phero-title", { type: "lines,chars", mask: "lines" });
        const tl = gsap
          .timeline({ paused: true, defaults: { ease: "power4.out" } })
          .from(split.chars, { yPercent: 120, rotation: 6, duration: 1, stagger: 0.03 }, 0.1)
          .from(".kr-phero-lede", { y: 30, opacity: 0, duration: 0.8 }, 0.5)
          .from(".kr-phero-bowl", { scale: 0, rotation: -160, duration: 1.3, ease: "back.out(1.5)" }, 0)
          .from(".kr-phero-garnish", { y: 200, rotation: 40, opacity: 0, duration: 1 }, 0.5);
        const stop = afterCurtain(() => tl.play());
        gsap.to(".kr-phero-spin", {
          rotation: 90,
          y: 70,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 1 },
        });
        gsap.fromTo(".kr-phero-float", { y: -12, rotation: -4 }, { y: 12, rotation: 4, duration: 2.3, ease: "sine.inOut", yoyo: true, repeat: -1 });
        return stop;
      });
      el.removeAttribute("data-intro");
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="kr-phero" data-intro="pending">
      <HeroBackdrop />
      <div className="kr-wrap kr-phero-grid">
        <div>
          <h1 className="kr-phero-title">{title}</h1>
          <p className="kr-phero-lede">{lede}</p>
        </div>
        <div className="kr-phero-media">
          <div className="kr-phero-spin">
            <Image src={bowl} alt="" width={1000} height={1000} sizes="(max-width: 860px) 70vw, 42vw" loading="eager" className="kr-phero-bowl" />
          </div>
          {garnish && (
            <div className="kr-phero-float">
              <Image src={garnish.src} alt="" width={garnish.w} height={garnish.h} sizes="180px" loading="eager" className="kr-phero-garnish" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
