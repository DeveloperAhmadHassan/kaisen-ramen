"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Scroll-in reveals for anything inside `scope` marked with data-reveal:
 *  - "title": letters rise out of their lines
 *  - "lines": each line of text slides up out of a mask
 *  - "up":    fades up
 *  - "group": its children fade up one after another
 * Each plays once, as it scrolls into view. Skipped for reduced motion.
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(scope);
        const at = (el: Element) => ({ trigger: el, start: "top 86%", once: true });

        q('[data-reveal="title"]').forEach((el) => {
          SplitText.create(el, {
            type: "lines,chars",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.chars, {
                yPercent: 120,
                rotation: 6,
                duration: 0.9,
                ease: "power4.out",
                stagger: 0.025,
                scrollTrigger: at(el),
              }),
          });
        });

        q('[data-reveal="lines"]').forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.08,
                scrollTrigger: at(el),
              }),
          });
        });

        q('[data-reveal="up"]').forEach((el) => {
          gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: at(el) });
        });

        q('[data-reveal="group"]').forEach((el) => {
          gsap.from(el.children, {
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: at(el),
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
