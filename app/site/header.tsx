"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { closeCart, countOf, openCart, useCart } from "../cart/store";

const LINKS = [
  ["Menu", "/menu"],
  ["Our story", "/story"],
  ["Noodle club", "/club"],
  ["Reserve", "/reserve"],
] as const;

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Site header. On the homepage it stays out of the hero's way and slides in once
 * you scroll past it; on other pages it's always there, firming up on scroll.
 */
export default function Header() {
  const path = usePathname();
  const { items } = useCart();
  const count = countOf(items);
  const bar = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const before = useRef(0);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const el = bar.current!;
    const sync = () => {
      const hidden = path === "/" && window.scrollY < window.innerHeight * 0.7;
      el.classList.toggle("is-hidden", hidden);
      el.classList.toggle("is-solid", window.scrollY > 40);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [path]);

  // the cart button bumps and the count flips whenever something's added
  useEffect(() => {
    if (count > before.current && !calm()) {
      gsap.fromTo(btn.current, { scale: 1.3 }, { scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.4)" });
      gsap.fromTo(badge.current, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "back.out(2)" });
    }
    before.current = count;
  }, [count]);

  // the mobile sheet drops like a curtain; links rise in after it
  useEffect(() => {
    const el = sheet.current!;
    const d = calm() ? 0 : 1;
    document.documentElement.classList.toggle("kr-locked", menu);
    if (menu) {
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(el, { yPercent: -100 }, { yPercent: 0, duration: 0.6 * d, ease: "power4.out" });
      gsap.fromTo(el.querySelectorAll("a"), { yPercent: 120 }, { yPercent: 0, duration: 0.6 * d, delay: 0.15 * d, ease: "power3.out", stagger: 0.06 });
    } else if (el.style.visibility === "visible") {
      gsap.to(el, { yPercent: -100, duration: 0.4 * d, ease: "power3.in", onComplete: () => gsap.set(el, { visibility: "hidden" }) });
    }
  }, [menu]);

  // one orange pill glides between the links under the cursor
  const hover = (e: MouseEvent<HTMLAnchorElement>) => {
    const a = e.currentTarget;
    gsap.to(pill.current, { x: a.offsetLeft, width: a.offsetWidth, opacity: 1, duration: calm() ? 0 : 0.4, ease: "power3.out" });
  };
  const leave = () => gsap.to(pill.current, { opacity: 0, duration: 0.25 });

  return (
    <>
      <header ref={bar} className="kr-bar is-hidden">
        <Link href="/" className="kr-logo" onClick={() => setMenu(false)}>
          Kaisen Ramen
        </Link>
        <nav className="kr-nav-links" aria-label="Main" onPointerLeave={leave}>
          <span ref={pill} className="kr-nav-pill" aria-hidden />
          {LINKS.map(([label, href]) => (
            <Link key={href} href={href} aria-current={path === href ? "page" : undefined} onPointerEnter={hover}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="kr-bar-side">
          <button ref={btn} type="button" className="kr-cart-btn" aria-label={`Your order: ${count} items`} onClick={openCart}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M2.5 11h19a9.5 9.5 0 0 1-19 0z" fill="currentColor" />
              <path d="M14 9.5 20 3M16 9.8 21.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span ref={badge} className="kr-cart-count">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`kr-burger${menu ? " is-open" : ""}`}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => {
              closeCart();
              setMenu((m) => !m);
            }}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      <div ref={sheet} className="kr-sheet kr-pat kr-pat-waves" style={{ visibility: "hidden" }}>
        <nav aria-label="Mobile">
          {[["Home", "/"] as const, ...LINKS].map(([label, href]) => (
            <span key={href} className="kr-sheet-line">
              <Link href={href} onClick={() => setMenu(false)}>
                {label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </>
  );
}
