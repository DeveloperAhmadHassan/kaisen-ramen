"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { MENU } from "../data/menu";
import { FREE_DELIVERY_AT, addToCart, closeCart, countOf, money, setQty, subtotalOf, useCart } from "./store";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Thumb({ src, name }: { src?: string; name: string }) {
  return src ? (
    <Image src={src} alt="" width={120} height={120} sizes="72px" className="kr-thumb" />
  ) : (
    <span className="kr-thumb kr-thumb-text" aria-hidden>
      {name[0]}
    </span>
  );
}

export function Stepper({ value, label, onChange }: { value: number; label: string; onChange: (n: number) => void }) {
  const num = useRef<HTMLSpanElement>(null);
  const step = (e: MouseEvent<HTMLButtonElement>, by: number) => {
    if (!calm()) {
      gsap.fromTo(e.currentTarget, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: "elastic.out(1.2, 0.4)" });
      gsap.fromTo(num.current, { yPercent: by * 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: "back.out(2)" });
    }
    onChange(value + by);
  };
  return (
    <div className="kr-stepper">
      <button type="button" aria-label={`One less ${label}`} onClick={(e) => step(e, -1)}>
        −
      </button>
      <span ref={num} aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={`One more ${label}`} onClick={(e) => step(e, 1)}>
        +
      </button>
    </div>
  );
}

/** Slide-in cart: quantities, a free-delivery bar, a suggestion and the way to checkout. */
export default function CartDrawer() {
  const { items, open } = useCart();
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const totalEl = useRef<HTMLElement>(null);
  const shown = useRef({ total: 0 });
  const subtotal = subtotalOf(items);
  const left = Math.max(0, FREE_DELIVERY_AT - subtotal);
  const suggestion = MENU.find((m) => m.kind === "sides" && !items.some((i) => i.id === m.id));

  // slide in and out; the rows follow one after another
  useEffect(() => {
    const d = calm() ? 0 : 1;
    const [wrap, side, dim] = [root.current, panel.current, shade.current];
    if (open) {
      const before = document.activeElement as HTMLElement | null;
      gsap.set(root.current, { visibility: "visible" });
      gsap.to(shade.current, { opacity: 1, duration: 0.35 * d });
      gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: 0.6 * d, ease: "power4.out" });
      const rows = side!.querySelectorAll(".kr-line");
      if (rows.length) gsap.from(rows, { x: 50, opacity: 0, duration: 0.5 * d, stagger: 0.06, delay: 0.15 * d, ease: "power3.out", clearProps: "x,opacity" });
      document.documentElement.style.overflow = "hidden";
      panel.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.documentElement.style.overflow = "";
        before?.focus?.();
        gsap.to(dim, { opacity: 0, duration: 0.3 * d });
        gsap.to(side, {
          xPercent: 100,
          duration: 0.4 * d,
          ease: "power3.in",
          onComplete: () => {
            gsap.set(wrap, { visibility: "hidden" });
          },
        });
      };
    }
  }, [open]);

  // the total ticks to its new value, and the bar fills towards free delivery
  useEffect(() => {
    gsap.to(shown.current, {
      total: subtotal,
      duration: calm() ? 0 : 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (totalEl.current) totalEl.current.textContent = money(shown.current.total);
      },
    });
    const bar = panel.current?.querySelector(".kr-drawer-bar i");
    if (bar) gsap.to(bar, { scaleX: Math.min(1, subtotal / FREE_DELIVERY_AT), duration: calm() ? 0 : 0.6, ease: "power3.out" });
  }, [subtotal]);

  // a removed row folds up before it leaves the cart
  const remove = (e: MouseEvent<HTMLButtonElement>, id: string) => {
    const row = e.currentTarget.closest(".kr-line");
    if (calm() || !row) {
      setQty(id, 0);
      return;
    }
    gsap.to(row, { x: 80, opacity: 0, height: 0, paddingBlock: 0, marginBlock: 0, duration: 0.35, ease: "power2.in", onComplete: () => setQty(id, 0) });
  };

  return (
    <div ref={root} className="kr-drawer-root" style={{ visibility: "hidden" }}>
      <div ref={shade} className="kr-drawer-shade" style={{ opacity: 0 }} onClick={closeCart} />
      <aside ref={panel} className="kr-drawer" role="dialog" aria-modal="true" aria-label="Your order" tabIndex={-1}>
        <header className="kr-drawer-head">
          <h2>Your order</h2>
          <span>{countOf(items)} items</span>
          <button type="button" className="kr-drawer-x" aria-label="Close your order" onClick={closeCart}>
            <svg viewBox="0 0 16 16" aria-hidden>
              <path d="M2 2l12 12M14 2 2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="kr-drawer-empty">
            <svg viewBox="0 0 100 100" aria-hidden>
              <path d="M12 48h76a38 38 0 0 1-76 0zM38 90h24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M38 36c-5-6 5-9 0-15M50 34c-5-6 5-9 0-15M62 36c-5-6 5-9 0-15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p>Your bowl is empty.</p>
            <Link href="/menu" className="kr-btn" onClick={closeCart}>
              See the menu
            </Link>
          </div>
        ) : (
          <>
            <div className="kr-drawer-bar" aria-hidden>
              <i style={{ transform: "scaleX(0)" }} />
            </div>
            <p className="kr-drawer-note">{left > 0 ? `${money(left)} away from free delivery` : "You've earned free delivery"}</p>
            <ul className="kr-lines">
              {items.map((item) => (
                <li key={item.id} className="kr-line">
                  <Thumb src={item.src} name={item.name} />
                  <div className="kr-line-info">
                    <strong>{item.name}</strong>
                    <span>{money(item.price * item.qty)}</span>
                    <Stepper value={item.qty} label={item.name} onChange={(n) => setQty(item.id, n)} />
                  </div>
                  <button type="button" className="kr-line-x" aria-label={`Remove ${item.name}`} onClick={(e) => remove(e, item.id)}>
                    <svg viewBox="0 0 16 16" aria-hidden>
                      <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            {suggestion && (
              <button type="button" className="kr-suggest" onClick={() => addToCart(suggestion)}>
                <Thumb src={suggestion.src} name={suggestion.name} />
                <span>
                  Add <strong>{suggestion.name}</strong>?
                </span>
                <em>+{money(suggestion.price)}</em>
              </button>
            )}
            <footer className="kr-drawer-foot">
              <div>
                <span>Subtotal</span>
                <strong ref={totalEl}>{money(subtotal)}</strong>
              </div>
              <Link href="/checkout" className="kr-btn kr-btn-wide" onClick={closeCart}>
                Go to checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
