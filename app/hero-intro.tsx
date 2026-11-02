"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { afterCurtain } from "./reload";

gsap.registerPlugin(useGSAP);

// Timeline beats (seconds). The tray drops in over TRAY_DUR; "half done" cues
// hang off its midpoint and the bowls' midpoint.
const TRAY_DUR = 1.4;
const BOWLS_AT = 0.25;
const BOWLS_DUR = 1.1;
const TRAY_HALF = TRAY_DUR / 2;
const BOWLS_HALF = BOWLS_AT + BOWLS_DUR / 2;

/**
 * Plays the hero's entrance once on load. Rendered as the artboard's last child
 * so the carousel has placed its bowls before this runs. Until it starts, the
 * artboard carries data-intro="pending", which keeps the moving pieces hidden.
 */
export default function HeroIntro() {
  const marker = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const board = marker.current?.closest<HTMLElement>(".kr-artboard");
    if (!board) return;
    const q = gsap.utils.selector(board);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const h = board.offsetHeight;
      const [prev, next] = q(".kr-nav");
      // built paused, so every piece is parked at its start state behind the
      // curtain; it plays once the reload curtain's middle panel has lifted
      // (straight away when there's no curtain)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });
      tl
        // the tray drops in from above while the bowls grow from nothing
        .from(q(".kr-board"), { yPercent: -100, duration: TRAY_DUR }, 0)
        .from(q(".kr-bowl"), { scale: 0, duration: BOWLS_DUR, ease: "back.out(1.5)", stagger: 0.08 }, BOWLS_AT)
        // tray half done: titles rise out of their lines; garnishes, chopsticks and CTA come up from below
        // (140%, not 100%: the masks are padded so glyphs aren't clipped, so start below that too)
        .from(q(".kr-mask-inner"), { yPercent: 140, duration: 0.9, stagger: 0.12 }, TRAY_HALF)
        .from(q(".kr-rule"), { scaleX: 0, duration: 0.9, ease: "power2.out" }, TRAY_HALF)
        .from(q(".kr-float-item"), { y: h * 0.6, duration: 1, stagger: 0.03 }, TRAY_HALF)
        .from(q(".kr-chopsticks"), { y: h * 0.4, duration: 1, stagger: 0.08 }, TRAY_HALF + 0.05)
        .from(q(".kr-cta"), { y: h * 0.3, opacity: 0, duration: 0.9 }, TRAY_HALF + 0.15)
        // bowls half done: the dish name rises out of its lines; the arrows slide out to the sides
        .from(q(".kr-dish .kr-char"), { yPercent: 140, duration: 0.6, stagger: 0.04 }, BOWLS_HALF)
        .from(q(".kr-ornament"), { opacity: 0, y: h * 0.02, duration: 0.6 }, BOWLS_HALF)
        .from(prev, { x: h * 0.06, opacity: 0, duration: 0.8 }, BOWLS_HALF)
        .from(next, { x: -h * 0.06, opacity: 0, duration: 0.8 }, BOWLS_HALF);
      return afterCurtain(() => tl.play());
    });

    // the start states are set above, so the pieces can be revealed now
    board.removeAttribute("data-intro");
    return () => mm.revert();
  });

  return <span ref={marker} hidden />;
}
