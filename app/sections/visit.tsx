"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HOURS } from "./hours";
import { MOTION_OK, useReveal } from "./reveal";

gsap.registerPlugin(useGSAP);


/** A paper lantern (chochin) with a soft glow inside. */
function Lantern() {
  return (
    <svg className="kr-lantern" viewBox="0 0 160 260" aria-hidden>
      <defs>
        <radialGradient id="kr-lantern-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0" stopColor="#ff9a4d" />
          <stop offset="0.7" stopColor="#d1361f" />
          <stop offset="1" stopColor="#8e1210" />
        </radialGradient>
      </defs>
      <line x1="80" y1="0" x2="80" y2="34" stroke="#2b1b14" strokeWidth="3" />
      <rect x="44" y="30" width="72" height="16" rx="4" fill="#2b1b14" />
      <path d="M44 46c-40 30-40 138 0 168h72c40-30 40-138 0-168z" fill="url(#kr-lantern-glow)" />
      <g fill="none" stroke="rgba(60,0,0,0.35)" strokeWidth="2">
        <path d="M30 80h100M22 112h116M20 144h120M24 176h112" />
      </g>
      <circle cx="80" cy="128" r="30" fill="#f4e7d2" opacity="0.92" />
      <path d="M62 128h36a18 18 0 0 1-36 0z" fill="#8e1210" />
      <rect x="44" y="214" width="72" height="16" rx="4" fill="#2b1b14" />
      <path d="M70 230v22M80 230v28M90 230v22" stroke="#e9852f" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Visit us: hours and address reveal on scroll, a swaying lantern, and a magnetic Reserve button. */
export default function Visit() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(".kr-lantern", { rotation: -5 }, { rotation: 5, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
        gsap.from(".kr-magnet", {
          scale: 0,
          rotation: -180,
          duration: 1.1,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ".kr-magnet", start: "top 90%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  // the button leans towards the cursor, and its label a little further
  const pull = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: dx * 0.35, y: dy * 0.35, scale: 1.06, duration: 0.5, ease: "power3.out" });
    gsap.to(el.querySelector("span"), { x: dx * 0.18, y: dy * 0.18, duration: 0.5, ease: "power3.out" });
  };
  const release = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    gsap.to([el, el.querySelector("span")], { x: 0, y: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.35)" });
  };

  return (
    <section ref={scope} className="kr-sec kr-visit kr-pat kr-pat-waves kr-brush kr-brush-d" id="visit">
      <div className="kr-wrap kr-visit-grid">
        <div>
          <h2 className="kr-h2" data-reveal="title">
            Come hungry. Leave happy.
          </h2>
          <ul className="kr-hours" data-reveal="group">
            {HOURS.map((h) => (
              <li key={h.label}>
                <span>{h.label}</span>
                <span>
                  {h.open} – {h.close}
                </span>
              </li>
            ))}
          </ul>
          <address className="kr-address" data-reveal="lines">
            12 Noodle Lane, Food District
            <br />
            Walk-ins welcome · Bookings for 6 or more
          </address>
        </div>
        <div className="kr-visit-side">
          <Lantern />
          <a href="#visit" className="kr-magnet" onPointerMove={pull} onPointerLeave={release}>
            <span>
              Reserve
              <br />a table
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
