import type { CSSProperties } from "react";

// The hero is laid out on an 800 x 600 artboard (the size of the design comp)
// and scales as one piece, so every element keeps its exact position. On
// portrait screens the artboard shows a narrower, taller window onto the same
// design (hero.css sets --u, --ox and --m for that).
export const ART_W = 800;
export const ART_H = 600;
// the portrait frame's width in design px, and when it applies (match hero.css)
export const MOBILE_W = 380;
const MOBILE_QUERY = "(max-aspect-ratio: 4/5)";

type Box = readonly [x0: number, y0: number, x1: number];

// Shares of the portrait frame's spare height (see box()): garnishes ease down a
// little, the name group sits between, and the chopsticks stay in the corners.
export const DROP_GARNISH = 0.3;
export const DROP_LOWER = 0.55;
export const DROP_CORNERS = 1;

// A design coordinate, or one that switches to its mobile value when --m is 1.
function coord(desktop: number, mobile?: number) {
  return mobile === undefined || mobile === desktop ? `${desktop}` : `(${desktop} + var(--m) * ${mobile - desktop})`;
}

/**
 * Place an element at design px x0..x1, top y0; `mobile` gives the portrait-frame
 * box. On tall screens the frame has spare height (--stretch); `drop` is the
 * share of it (0..1) this element moves down by, spreading the lower half out.
 */
export function box(x0: number, y0: number, x1: number, mobile?: Box, drop = 0): CSSProperties {
  const left = coord(x0, mobile?.[0]);
  return {
    left: `calc((${left} - var(--ox)) * var(--u))`,
    top: `calc(${coord(y0, mobile?.[1])} * var(--u)${drop ? ` + var(--stretch) * ${drop}` : ""})`,
    width: `calc((${coord(x1, mobile?.[2])} - ${left}) * var(--u))`,
  };
}

/** `sizes` for an image `w` design px wide (`mobileW` in the portrait frame). */
export function sizes(w: number, mobileW = w) {
  return `${MOBILE_QUERY} ${(mobileW / MOBILE_W) * 100}vw, ${(w / ART_W) * 100}vw`;
}
