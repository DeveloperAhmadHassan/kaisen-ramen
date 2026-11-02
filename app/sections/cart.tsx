"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// The menu and the bowl builder add to the cart through this window event.
const CART_ADD = "kr:cart-add";

export type CartItem = { name: string; price: number };

export function addToCart(item: CartItem) {
  window.dispatchEvent(new CustomEvent<CartItem>(CART_ADD, { detail: item }));
}

export const money = (n: number) => `$${n.toFixed(2)}`;

function BowlIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M2.5 11h19a9.5 9.5 0 0 1-19 0z" fill="currentColor" />
      <path d="M14 9.5 20 3M16 9.8 21.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Floating cart: pops in with the first item, bumps on every add, opens a summary on click. */
export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onAdd = (e: Event) => setItems((list) => [...list, (e as CustomEvent<CartItem>).detail]);
    window.addEventListener(CART_ADD, onAdd);
    return () => window.removeEventListener(CART_ADD, onAdd);
  }, []);

  // pop in on the first item, then bump and flip the count on each one after
  useEffect(() => {
    if (!items.length) return;
    if (items.length === 1) {
      gsap.fromTo(root.current, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.8)" });
    } else {
      gsap.fromTo(btn.current, { scale: 1.28 }, { scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.4)" });
    }
    gsap.fromTo(count.current, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "back.out(2)" });
  }, [items.length]);

  // clicking anywhere outside the cart closes the summary
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  useEffect(() => {
    if (!panel.current) return;
    gsap.to(panel.current, {
      autoAlpha: open ? 1 : 0,
      scale: open ? 1 : 0.85,
      y: open ? 0 : 14,
      duration: open ? 0.45 : 0.25,
      ease: open ? "back.out(1.7)" : "power2.in",
    });
  }, [open]);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <div ref={root} className="kr-cart" style={items.length ? undefined : { visibility: "hidden" }}>
      <div ref={panel} className="kr-cart-panel" role="dialog" aria-label="Your order" aria-hidden={!open}>
        <h4>Your order</h4>
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <span>{item.name}</span>
              <span>{money(item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="kr-cart-total">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>
      </div>
      <button
        ref={btn}
        type="button"
        className="kr-cart-btn"
        aria-label={`Your order: ${items.length} item${items.length === 1 ? "" : "s"}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <BowlIcon />
        <span ref={count} className="kr-cart-count">
          {items.length}
        </span>
      </button>
    </div>
  );
}
