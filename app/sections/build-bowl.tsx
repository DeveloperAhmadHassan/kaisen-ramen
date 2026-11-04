"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { flyToCart } from "../cart/fly";
import { money } from "../cart/store";
import { MOTION_OK, useReveal } from "./reveal";

gsap.registerPlugin(useGSAP);

const BASE = 9; // placeholder base price for broth + noodles

// where each topping sits in the bowl (% of the bowl box) and at what angle
const TOPPINGS = [
  { id: "egg", name: "Ajitama egg", price: 2.5, src: "/images/garnish-egg-half.png", w: 786, h: 648, at: [52, 20, 28], rot: 12 },
  { id: "chicken", name: "Grilled tori", price: 3.5, src: "/images/chicken.png", w: 706, h: 398, at: [16, 46, 40], rot: -14 },
  { id: "corn", name: "Butter corn", price: 1.5, src: "/images/garnish-corn.png", w: 800, h: 601, at: [54, 54, 30], rot: 24 },
  { id: "mushroom", name: "Mushrooms", price: 2, src: "/images/garnish-mushroom.png", w: 800, h: 534, at: [20, 20, 30], rot: -8 },
  { id: "onion", name: "Green onion", price: 1, src: "/images/garnish-green-onion.png", w: 793, h: 800, at: [38, 34, 24], rot: 30 },
  { id: "chili", name: "Fresh chili", price: 1, src: "/images/chili.png", w: 740, h: 363, at: [32, 70, 32], rot: -18 },
] as const;
type ToppingId = (typeof TOPPINGS)[number]["id"];

const START: ToppingId[] = ["egg", "onion"];
const priceOf = (id: ToppingId) => TOPPINGS.find((t) => t.id === id)!.price;
const totalOf = (ids: ToppingId[]) => BASE + ids.reduce((s, id) => s + priceOf(id), 0);
const START_TOTAL = totalOf(START);

/** A top-down bowl of broth and noodles. */
function BowlArt() {
  return (
    <svg viewBox="0 0 400 400" aria-hidden>
      <defs>
        <radialGradient id="kr-broth" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#f0b469" />
          <stop offset="0.6" stopColor="#d1803a" />
          <stop offset="1" stopColor="#9c4d1c" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="196" fill="#1d1513" />
      <circle cx="200" cy="200" r="190" fill="none" stroke="#3a2c27" strokeWidth="3" />
      <circle cx="200" cy="200" r="172" fill="#2b201c" />
      <circle cx="200" cy="200" r="162" fill="url(#kr-broth)" />
      <g fill="none" stroke="#f6d79a" strokeWidth="6" strokeLinecap="round" opacity="0.9">
        <path d="M120 230c30 40 120 40 150-10s-20-110-80-100-90 70-40 110 120 10 110-50" />
        <path d="M100 190c10-60 90-100 150-70s70 110 20 150-140 30-160-20" />
        <path d="M150 280c-50-30-60-100-10-140s130-30 150 30" />
        <path d="M230 300c60-20 90-90 50-150" />
      </g>
      <g fill="rgba(255,236,190,0.45)">
        <circle cx="150" cy="140" r="6" />
        <circle cx="262" cy="250" r="4" />
        <circle cx="120" cy="262" r="5" />
        <circle cx="280" cy="150" r="3" />
        <circle cx="210" cy="310" r="4" />
      </g>
    </svg>
  );
}

/** Build your own bowl: toppings drop in (and pop out) as their chips are toggled. */
export default function BuildBowl() {
  const scope = useRef<HTMLElement>(null);
  const totalEl = useRef<HTMLElement>(null);
  const shown = useRef({ total: START_TOTAL });
  const [picked, setPicked] = useState<ToppingId[]>(START);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // the bowl turns slowly, as if on a lazy susan
        gsap.to(".kr-build-spin", { rotation: 360, duration: 80, ease: "none", repeat: -1 });
        gsap.from(".kr-build-bowl", {
          scale: 0.6,
          rotation: -60,
          opacity: 0,
          duration: 1.2,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".kr-build-bowl", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  const toggle = (e: MouseEvent<HTMLButtonElement>, id: ToppingId) => {
    const t = TOPPINGS.find((x) => x.id === id)!;
    const on = !picked.includes(id);
    const next = on ? [...picked, id] : picked.filter((x) => x !== id);
    setPicked(next);

    const el = scope.current?.querySelector(`[data-topping="${id}"]`);
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.fromTo(e.currentTarget, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
    if (calm) {
      gsap.set(el, { autoAlpha: on ? 1 : 0 });
    } else if (on) {
      // dropped in from above: falls, lands with a bounce, and the bowl wobbles
      gsap.fromTo(
        el,
        { autoAlpha: 1, yPercent: -260, scale: 1.6, rotation: t.rot - 60 },
        { yPercent: 0, scale: 1, rotation: t.rot, duration: 0.85, ease: "bounce.out", overwrite: true },
      );
      gsap.fromTo(scope.current!.querySelector(".kr-build-spin > svg"), { scale: 0.96 }, { scale: 1, duration: 0.8, delay: 0.35, ease: "elastic.out(1.2, 0.35)" });
    } else {
      // plucked out: pops up, spins and vanishes
      gsap.to(el, { scale: 0, rotation: t.rot + 120, yPercent: -40, autoAlpha: 0, duration: 0.45, ease: "back.in(2)", overwrite: true });
    }

    // the total ticks to its new value
    const total = totalOf(next);
    gsap.to(shown.current, {
      total,
      duration: calm ? 0 : 0.6,
      ease: "power2.out",
      onUpdate: () => {
        if (totalEl.current) totalEl.current.textContent = money(shown.current.total);
      },
    });
  };

  const order = (e: MouseEvent<HTMLButtonElement>) => {
    gsap.fromTo(e.currentTarget, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: "elastic.out(1.2, 0.4)" });
    const names = TOPPINGS.filter((t) => picked.includes(t.id)).map((t) => t.name.toLowerCase());
    const img = scope.current?.querySelector<HTMLImageElement>(".kr-topping");
    flyToCart(img, { id: `custom-${names.join("-")}`, name: names.length ? `Custom bowl (${names.join(", ")})` : "Custom bowl", price: totalOf(picked), src: "/images/bowl-right.png" });
  };

  return (
    <section ref={scope} className="kr-sec kr-build kr-pat kr-pat-shippo kr-brush kr-brush-c" id="build">
      <div className="kr-wrap kr-build-grid">
        <div className="kr-build-bowl">
          <div className="kr-build-spin" style={{ position: "absolute", inset: 0 }}>
            <BowlArt />
            {TOPPINGS.map((t) => (
              <Image
                key={t.id}
                data-topping={t.id}
                src={t.src}
                alt=""
                width={t.w}
                height={t.h}
                sizes="(max-width: 860px) 30vw, 180px"
                className="kr-topping"
                style={{
                  left: `${t.at[0]}%`,
                  top: `${t.at[1]}%`,
                  width: `${t.at[2]}%`,
                  transform: `rotate(${t.rot}deg)`,
                  visibility: START.includes(t.id) ? "visible" : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="kr-h2" data-reveal="title">
            Your bowl, your way
          </h2>
          <p className="kr-lede" data-reveal="lines">
            Start with our house broth and fresh noodles, then pile on whatever you like. Tap a topping to drop it in;
            tap again to take it out.
          </p>
          <div className="kr-chips" data-reveal="group">
            {TOPPINGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="kr-chip"
                aria-pressed={picked.includes(t.id)}
                onClick={(e) => toggle(e, t.id)}
              >
                <Image src={t.src} alt="" width={t.w} height={t.h} sizes="34px" />
                {t.name} <small>+{money(t.price)}</small>
              </button>
            ))}
          </div>
          <div className="kr-build-total" data-reveal="up">
            <span>
              {/* GSAP owns this text after the first render (it ticks between totals) */}
              Total <strong ref={totalEl}>{money(START_TOTAL)}</strong>
            </span>
            <button type="button" className="kr-btn" onClick={order}>
              Add to order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
