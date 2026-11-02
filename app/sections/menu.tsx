"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { addToCart, money } from "./cart";
import { useReveal } from "./reveal";

gsap.registerPlugin(useGSAP);

type Kind = "ramen" | "sides";
type Filter = "all" | Kind;

// placeholder prices and descriptions
const ITEMS: { name: string; kind: Kind; price: number; text: string; src: string; w: number; h: number }[] = [
  { name: "Kara Tori", kind: "ramen", price: 15.5, text: "Fiery broth, kimchi, chili oil, braised beef and a jammy egg.", src: "/images/bowl-main.png", w: 1000, h: 1000 },
  { name: "Miso Tori", kind: "ramen", price: 14, text: "Rich miso broth, charred chicken, sweet corn and greens.", src: "/images/bowl-right.png", w: 1000, h: 1000 },
  { name: "Chashu Men", kind: "ramen", price: 16, text: "Torched pork chashu, two soft eggs, scallions and fresh chili.", src: "/images/bowl-left.png", w: 1000, h: 1000 },
  { name: "Tsukimi Soba", kind: "ramen", price: 13, text: "Buckwheat noodles in dashi under a golden 'moon' yolk.", src: "/images/bowl-top.png", w: 1000, h: 1000 },
  { name: "Grilled Tori", kind: "sides", price: 7, text: "Herb-crusted chicken breast, sliced off the grill.", src: "/images/chicken.png", w: 706, h: 398 },
  { name: "Ajitama", kind: "sides", price: 2.5, text: "Soy-marinated soft-boiled egg with a molten yolk.", src: "/images/garnish-egg-half.png", w: 786, h: 648 },
  { name: "Butter Corn", kind: "sides", price: 4, text: "Sweet corn on the cob, glossed with miso butter.", src: "/images/garnish-corn.png", w: 800, h: 601 },
  { name: "Mushrooms", kind: "sides", price: 4.5, text: "Button mushrooms seared hot with garlic and soy.", src: "/images/garnish-mushroom.png", w: 800, h: 534 },
];

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

  // 3D tilt towards the cursor, with a glare that follows it
  const tilt = (e: PointerEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, { rotationY: px * 16, rotationX: -py * 16, duration: 0.5, ease: "power2.out" });
    card.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    card.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };
  const hover = (card: HTMLElement, on: boolean) => {
    // set the perspective outright: tweened up from zero, its first frames are so
    // short that the image (lifted 40px in 3D) flashes up to nearly double size
    if (on) gsap.set(card, { transformPerspective: 900 });
    if (!on) gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
    gsap.to(card.querySelector(".kr-card-media img"), {
      rotation: on ? 18 : 0,
      scale: on ? 1.08 : 1,
      duration: 0.6,
      ease: on ? "back.out(2)" : "power2.out",
    });
  };

  // a copy of the dish arcs over to the cart, spinning and shrinking
  const add = (e: MouseEvent<HTMLButtonElement>, item: (typeof ITEMS)[number]) => {
    const btn = e.currentTarget;
    gsap.fromTo(btn, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    const img = btn.closest(".kr-card")?.querySelector<HTMLImageElement>(".kr-card-media img");
    const cart = document.querySelector(".kr-cart-btn");
    if (!img || !cart || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      addToCart(item);
      return;
    }
    const from = img.getBoundingClientRect();
    const to = cart.getBoundingClientRect();
    const fly = img.cloneNode() as HTMLImageElement;
    fly.className = "kr-fly";
    Object.assign(fly.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
    document.body.appendChild(fly);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    gsap
      .timeline({
        onComplete: () => {
          fly.remove();
          addToCart(item);
        },
      })
      .to(fly, { x: dx, duration: 0.9, ease: "power1.inOut" }, 0)
      .to(fly, { keyframes: { y: [0, -140, dy], easeEach: "sine.inOut" }, duration: 0.9 }, 0)
      .to(fly, { scale: 0.18, rotation: 300, duration: 0.9, ease: "power2.in" }, 0);
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
              style={shows(filter, item.kind) ? undefined : { display: "none" }}
              onPointerMove={tilt}
              onPointerEnter={(e) => hover(e.currentTarget, true)}
              onPointerLeave={(e) => hover(e.currentTarget, false)}
            >
              <span className="kr-card-glare" aria-hidden />
              <div className="kr-card-media">
                <Image
                  src={item.src}
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
      </div>
    </section>
  );
}
