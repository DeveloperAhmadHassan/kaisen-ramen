"use client";

import type { PointerEvent } from "react";
import gsap from "gsap";

/** The pill CTA: lifts, glows and catches a shine on hover; squashes and ripples on click. */
export default function BuyNow() {
  const hover = (el: HTMLElement, on: boolean) => {
    gsap.to(el, {
      yPercent: on ? -10 : 0,
      scale: on ? 1.07 : 1,
      filter: on ? "brightness(1.12) saturate(1.1)" : "brightness(1) saturate(1)",
      duration: on ? 0.4 : 0.3,
      ease: on ? "back.out(2)" : "power2.out",
      overwrite: "auto",
    });
    gsap.to(el.querySelector(".kr-cta-glow"), { opacity: on ? 1 : 0, duration: 0.35, overwrite: "auto" });
    gsap.to(el.querySelector(".kr-cta-label"), {
      letterSpacing: on ? "0.18em" : "0.09em",
      duration: 0.35,
      overwrite: "auto",
    });
    if (on) {
      gsap.fromTo(
        el.querySelector(".kr-cta-shine"),
        // starts parked off the left edge (left: -60%) and ends past the right one
        { xPercent: 0 },
        { xPercent: 480, duration: 0.75, ease: "power2.inOut" },
      );
    }
  };

  const press = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    gsap.fromTo(
      el,
      { scale: 0.92 },
      { scale: el.matches(":hover") ? 1.07 : 1, duration: 0.55, ease: "elastic.out(1.1, 0.45)", overwrite: "auto" },
    );

    // ripple from where the pointer landed
    const r = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "kr-cta-ripple";
    ripple.style.left = `${e.clientX - r.left}px`;
    ripple.style.top = `${e.clientY - r.top}px`;
    el.appendChild(ripple);
    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 0.6 },
      {
        scale: (r.width / ripple.offsetWidth) * 2.4,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      },
    );
  };

  return (
    <a
      href="#order"
      className="kr-cta"
      onPointerEnter={(e) => hover(e.currentTarget, true)}
      onPointerLeave={(e) => hover(e.currentTarget, false)}
      onFocus={(e) => hover(e.currentTarget, true)}
      onBlur={(e) => hover(e.currentTarget, false)}
      onPointerDown={press}
    >
      <span className="kr-cta-glow" aria-hidden />
      <span className="kr-cta-shine" aria-hidden />
      <span className="kr-cta-label">Buy Now</span>
    </a>
  );
}
