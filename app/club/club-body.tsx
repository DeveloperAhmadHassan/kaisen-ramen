"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";
import { Signup } from "../sections/footer";
import { MOTION_OK, useReveal } from "../sections/reveal";
import { tilt, tiltHover } from "../site/tilt";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

const SLOTS = 10;

// placeholder programme details
const TIERS = [
  ["Nori", "Sign up", ["A free ajitama on your first visit", "Birthday bowl on us", "The monthly newsletter"]],
  ["Chashu", "After 10 bowls", ["Everything in Nori", "Skip-the-queue Tuesdays", "First taste of new specials"]],
  ["Kaisen", "After 30 bowls", ["Everything in Chashu", "Your name on a counter stool", "A seat at the tasting table"]],
] as const;

const PERKS = [
  ["Secret menu", "One off-menu bowl each month, for members only."],
  ["Tuesday queue-jump", "Walk past the line, straight to your stool."],
  ["Tasting table", "Help us test new broths before they launch."],
  ["Noodle school", "A hands-on morning in the noodle room."],
  ["Birthday bowl", "Any bowl, on the house, all birthday week."],
];

/** Noodle club: a stamp card you can fill, tilting tiers, and a draggable row of perks. */
export default function ClubBody() {
  const scope = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const [stamps, setStamps] = useState(3);
  const before = useRef(stamps);
  const full = stamps >= SLOTS;
  useReveal(scope);

  // a bowl lands on the card with a thud; the tenth sets off a little burst
  useEffect(() => {
    const added = stamps > before.current;
    before.current = stamps;
    if (!added || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const icon = scope.current!.querySelectorAll(".kr-slot")[stamps - 1].querySelector("svg");
    gsap.fromTo(icon, { scale: 2.4, rotation: -30, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.35, ease: "power4.in" });
    gsap.fromTo(".kr-stampcard", { y: 0 }, { keyframes: { y: [0, 5, 0] }, delay: 0.3, duration: 0.25 });
    if (stamps === SLOTS) {
      gsap.fromTo(".kr-slot svg", { scale: 1 }, { keyframes: { scale: [1, 1.25, 1] }, duration: 0.5, delay: 0.35, stagger: 0.04 });
    }
  }, [stamps]);

  useGSAP(
    () => {
      const el = row.current!;
      const bounds = el.parentElement!;
      // throw the perks sideways; they glide to a stop
      const [drag] = Draggable.create(el, { type: "x", bounds, inertia: true, edgeResistance: 0.85, cursor: "grab", activeCursor: "grabbing" });
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".kr-slot", {
          scale: 0,
          rotation: -40,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.05,
          scrollTrigger: { trigger: ".kr-stampcard", start: "top 75%", once: true },
        });
        gsap.from(".kr-perk", { x: 120, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      });
      return () => {
        drag.kill();
        mm.revert();
      };
    },
    { scope },
  );

  const stamp = () => setStamps(full ? 0 : stamps + 1);

  return (
    <div ref={scope}>
      <section className="kr-sec kr-story kr-pat kr-pat-shippo kr-brush kr-brush-a">
        <div className="kr-wrap kr-club-grid">
          <div>
            <h2 className="kr-h2" data-reveal="title">
              Ten bowls, one on us
            </h2>
            <p className="kr-lede" data-reveal="lines">
              Every bowl you finish earns a stamp. Fill the card and your next one is free. Try it: give the card a go.
            </p>
            <div data-reveal="up">
              <button type="button" className="kr-btn kr-btn-dark kr-stamp-btn" onClick={stamp}>
                {full ? "Start a new card" : "Eat a bowl"}
              </button>
            </div>
          </div>
          <div className="kr-stampcard" data-reveal="up">
            <p className="kr-stampcard-head">
              <span>Kaisen Noodle Club</span>
              <span>
                {stamps} / {SLOTS}
              </span>
            </p>
            <div className="kr-slots">
              {Array.from({ length: SLOTS }, (_, i) => (
                <span key={i} className={`kr-slot${i === SLOTS - 1 ? " is-free" : ""}`}>
                  {i < stamps ? (
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <path d="M3 11h18a9 9 0 0 1-18 0z" fill="currentColor" />
                      <path d="M9 8c-1-1.4 1-2.2 0-3.6M14 8c-1-1.4 1-2.2 0-3.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : (
                    i === SLOTS - 1 && "Free"
                  )}
                </span>
              ))}
            </div>
            <p className="kr-stampcard-foot" role="status">
              {full ? "Your next bowl is free!" : `${SLOTS - stamps} to go`}
            </p>
          </div>
        </div>
      </section>

      <section className="kr-sec kr-menu kr-pat kr-pat-waves kr-brush kr-brush-b">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            Climb the ranks
          </h2>
          <div className="kr-tiers" data-reveal="group">
            {TIERS.map(([name, when, perks]) => (
              <article
                key={name}
                className="kr-card kr-tier"
                onPointerMove={tilt}
                onPointerEnter={(e) => tiltHover(e.currentTarget, true)}
                onPointerLeave={(e) => tiltHover(e.currentTarget, false)}
              >
                <span className="kr-card-glare" aria-hidden />
                <span className="kr-card-tag">{when}</span>
                <h3>{name}</h3>
                <ul>
                  {perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="kr-sec kr-drinks kr-pat kr-pat-kikko kr-brush kr-brush-c">
        <div className="kr-wrap">
          <h2 className="kr-h2" data-reveal="title">
            Members get more
          </h2>
          <p className="kr-lede" data-reveal="up">
            Drag to see what&apos;s waiting for you.
          </p>
        </div>
        <div className="kr-perks">
          <div ref={row} className="kr-perks-row">
            {PERKS.map(([title, text]) => (
              <article key={title} className="kr-perk">
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="kr-sec kr-cta-band kr-visit kr-pat kr-pat-waves kr-brush kr-brush-d">
        <div className="kr-wrap kr-club-join">
          <h2 className="kr-h2" data-reveal="title">
            Join the club
          </h2>
          <div data-reveal="up">
            <Signup />
          </div>
        </div>
      </section>
    </div>
  );
}
