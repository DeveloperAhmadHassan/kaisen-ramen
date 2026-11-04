"use client";

import type { PointerEvent } from "react";
import gsap from "gsap";

// 3D tilt towards the cursor, with a glare that follows it (.kr-card)
export function tilt(e: PointerEvent<HTMLElement>) {
  const card = e.currentTarget;
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  gsap.to(card, { rotationY: px * 16, rotationX: -py * 16, duration: 0.5, ease: "power2.out" });
  card.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
  card.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
}

export function tiltHover(card: HTMLElement, on: boolean) {
  // set the perspective outright: tweened up from zero, its first frames are so
  // short that the image (lifted 40px in 3D) flashes up to nearly double size
  if (on) gsap.set(card, { transformPerspective: 900 });
  if (!on) gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
  const img = card.querySelector(".kr-card-media img");
  if (img) gsap.to(img, { rotation: on ? 18 : 0, scale: on ? 1.08 : 1, duration: 0.6, ease: on ? "back.out(2)" : "power2.out" });
}
