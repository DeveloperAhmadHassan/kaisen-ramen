"use client";

import { useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HeroBackdrop } from "../hero-backdrop";
import { afterCurtain } from "../reload";
import { MOTION_OK } from "../sections/reveal";
import "./lost.css";

gsap.registerPlugin(useGSAP);

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** 404: the bowl rolls in as the zero, the fours lean towards the cursor, and a click spins it. */
export default function Lost() {
  const scope = useRef<HTMLElement>(null);
  const spin = useRef(0);

  useGSAP(
    () => {
      const el = scope.current!;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap
          .timeline({ paused: true })
          .from(".kr-lost-digit", { yPercent: -130, rotation: (i) => (i ? 24 : -24), duration: 1, ease: "bounce.out", stagger: 0.12 }, 0)
          .from(".kr-lost-bowl", { xPercent: -520, rotation: -720, duration: 1.3, ease: "power3.out" }, 0.15)
          .from(".kr-lost-copy > *", { y: 34, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 }, 0.8);
        const stop = afterCurtain(() => tl.play());
        gsap.to(".kr-lost-bowl img", { rotation: 360, duration: 26, ease: "none", repeat: -1 });
        return stop;
      });
      el.removeAttribute("data-intro");
      return () => mm.revert();
    },
    { scope },
  );

  const lean = (e: PointerEvent<HTMLElement>) => {
    if (calm()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width - 0.5;
    gsap.to(e.currentTarget.querySelectorAll(".kr-lost-digit"), { rotation: t * 14, x: t * 26, duration: 0.6, ease: "power3.out" });
  };

  const whirl = (e: MouseEvent<HTMLButtonElement>) => {
    if (calm()) return;
    spin.current += 720;
    gsap.to(e.currentTarget, { rotation: spin.current, duration: 1.2, ease: "power3.out" });
    gsap.fromTo(e.currentTarget, { scale: 0.88 }, { scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.4)" });
  };

  return (
    <section ref={scope} className="kr-lost" data-intro="pending" onPointerMove={lean}>
      <HeroBackdrop />
      <div className="kr-wrap kr-lost-inner">
        <p className="kr-lost-num" aria-hidden>
          <span className="kr-lost-digit">4</span>
          <button type="button" className="kr-lost-bowl" tabIndex={-1} onClick={whirl}>
            <Image src="/images/bowl-top.png" alt="" width={1000} height={1000} sizes="280px" loading="eager" />
          </button>
          <span className="kr-lost-digit">4</span>
        </p>
        <div className="kr-lost-copy">
          <h1 className="kr-h2">This bowl is empty</h1>
          <p className="kr-lede">We looked everywhere, even under the noodles. The page you wanted isn&apos;t here.</p>
          <div className="kr-lost-links">
            <Link href="/" className="kr-btn">
              Back to home
            </Link>
            <Link href="/menu" className="kr-btn kr-btn-ghost">
              See the menu
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
