"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { flyToCart } from "../cart/fly";
import { money } from "../cart/store";
import { MENU, type MenuItem } from "../data/menu";
import { tilt, tiltHover } from "../site/tilt";
import { useReveal } from "./reveal";

gsap.registerPlugin(useGSAP);

type Kind = "ramen" | "sides";
type Filter = "all" | Kind;

const ITEMS = MENU.filter((i) => i.src);

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ramen", label: "Ramen" },
  { id: "sides", label: "Sides" },
];

function Plus() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden>
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const shows = (filter: Filter, kind: Kind) => filter === "all" || filter === kind;

/** Menu: filter tabs swap the cards (out, then in), cards tilt under the cursor, Add flings a bowl into the cart. */
export default function Menu() {
  const scope = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const fromHeight = useRef<number | null>(null);
  const wanted = useRef<Filter>("all");
  // `active` is the tab (moves at once); `filter` is what the grid shows (switches once the old cards are out)
  const [active, setActive] = useState<Filter>("all");
  const [filter, setFilter] = useState<Filter>("all");
  // bumped on every swap, so the cards come back in even when switching back to the shown category
  const [swaps, setSwaps] = useState(0);
  useReveal(scope);

  // slide the pill under the active tab
  useLayoutEffect(() => {
    const tab = scope.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (tab && pill.current) {
      gsap.to(pill.current, { x: tab.offsetLeft, width: tab.offsetWidth, duration: 0.5, ease: "power3.out" });
    }
  }, [active]);

  // the new cards are in the layout: ease the grid to its new height and bring them in
  useLayoutEffect(() => {
    const el = grid.current;
    if (!el || fromHeight.current === null) return;
    gsap.set(el, { clearProps: "height" });
    const to = el.offsetHeight;
    gsap.fromTo(el, { height: fromHeight.current }, { height: to, duration: 0.5, ease: "power3.inOut", clearProps: "height" });
    fromHeight.current = null;
    const cards = [...el.querySelectorAll<HTMLElement>(".kr-card")].filter((c) => c.style.display !== "none");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 34, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", stagger: 0.07, overwrite: true },
    );
  }, [swaps]);

  const choose = (id: Filter) => {
    if (id === wanted.current) return;
    wanted.current = id;
    setActive(id);
    const el = grid.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFilter(id);
      return;
    }
    // hold the grid's height while the current cards dip out, then swap the set
    gsap.killTweensOf(el);
    fromHeight.current = el.offsetHeight;
    gsap.set(el, { height: fromHeight.current });
    const cards = [...el.querySelectorAll<HTMLElement>(".kr-card")].filter((c) => c.style.display !== "none");
    gsap.to(cards, {
      opacity: 0,
      y: 18,
      scale: 0.96,
      duration: 0.25,
      ease: "power2.in",
      stagger: 0.03,
      overwrite: true,
      onComplete: () => {
        fromHeight.current = el.offsetHeight;
        setFilter(wanted.current);
        setSwaps((n) => n + 1);
      },
    });
  };

  const add = (e: MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    const btn = e.currentTarget;
    gsap.fromTo(btn, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    flyToCart(btn.closest(".kr-card")?.querySelector<HTMLImageElement>(".kr-card-media img"), item);
  };

  return (
    <section ref={scope} className="kr-sec kr-menu kr-pat kr-pat-waves kr-brush kr-brush-b" id="order">
      <div className="kr-wrap">
        <div className="kr-menu-head">
          <div>
            <h2 className="kr-h2" data-reveal="title">
              Pick your bowl
            </h2>
          </div>
          <div className="kr-tabs" role="tablist" aria-label="Filter the menu" data-reveal="up">
            <span ref={pill} className="kr-tab-pill" aria-hidden />
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className="kr-tab"
                data-tab={t.id}
                aria-selected={active === t.id}
                onClick={() => choose(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={grid} className="kr-menu-grid" data-reveal="group">
          {ITEMS.map((item) => (
            <article
              key={item.name}
              className="kr-card"
              style={shows(filter, item.kind as Kind) ? undefined : { display: "none" }}
              onPointerMove={tilt}
              onPointerEnter={(e) => tiltHover(e.currentTarget, true)}
              onPointerLeave={(e) => tiltHover(e.currentTarget, false)}
            >
              <span className="kr-card-glare" aria-hidden />
              <div className="kr-card-media">
                <Image
                  src={item.src!}
                  alt={item.name}
                  width={item.w}
                  height={item.h}
                  sizes="(max-width: 600px) 80vw, 280px"
                  // the bowls are also the hero's images; a lazy copy trips Next's LCP check
                  loading={item.kind === "ramen" ? "eager" : undefined}
                />
              </div>
              <span className="kr-card-tag">{item.kind === "ramen" ? "Ramen" : "Side"}</span>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <div className="kr-card-foot">
                <span className="kr-price">{money(item.price)}</span>
                <button type="button" className="kr-add" onClick={(e) => add(e, item)}>
                  <Plus /> Add
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="kr-more" data-reveal="up">
          <Link href="/menu" className="kr-btn">
            See the full menu
          </Link>
        </p>
      </div>
    </section>
  );
}
