"use client";

import gsap from "gsap";
import { addToCart, type CartItem } from "./store";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A copy of the dish arcs over to the cart button, spinning and shrinking, then the item is added. */
export function flyToCart(img: HTMLImageElement | null | undefined, item: Omit<CartItem, "qty" | "id"> & { id?: string }, qty = 1) {
  const cart = document.querySelector(".kr-cart-btn");
  if (!img || !cart || calm()) {
    addToCart(item, qty);
    return;
  }
  const from = img.getBoundingClientRect();
  const to = cart.getBoundingClientRect();
  const fly = img.cloneNode() as HTMLImageElement;
  fly.className = "kr-fly";
  fly.removeAttribute("style");
  Object.assign(fly.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
  document.body.appendChild(fly);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  gsap
    .timeline({
      onComplete: () => {
        fly.remove();
        addToCart(item, qty);
      },
    })
    .to(fly, { x: dx, duration: 0.9, ease: "power1.inOut" }, 0)
    .to(fly, { keyframes: { y: [0, Math.min(dy, 0) - 90, dy], easeEach: "sine.inOut" }, duration: 0.9 }, 0)
    .to(fly, { scale: 0.14, rotation: 300, duration: 0.9, ease: "power2.in" }, 0);
}
