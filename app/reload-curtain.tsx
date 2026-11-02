"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { RELOAD_REVEAL_AT, cueHero, finishCurtain, isReload } from "./reload";
import "./reload-curtain.css";

gsap.registerPlugin(useGSAP);

const PANELS = 5;
const WORDS = ["Kaisen", "Ramen"];
const CHARS = WORDS.join("").length;
const STEAM = 3;

// The print is repeated in every panel, so stagger by position within one copy
// (index % per-copy count); otherwise the copies would draw one after another.
const perCopy = (n: number, each: number) => (i: number) => (i % n) * each;
// each panel's swing as it's pushed aside (the cloth hangs dead still before
// that: any lean would shear the print apart at the seams)
const SWING = [-9, -5, 3, 6, 10];
const LIFT_DUR = 0.8;

/** The shop crest: a bowl with rising steam and chopsticks, inside a stitched ring. */
function Crest() {
  return (
    <svg className="kr-crest" viewBox="0 0 200 200" aria-hidden>
      <circle cx="100" cy="100" r="96" className="kr-crest-disc" />
      <circle cx="100" cy="100" r="86" pathLength={1} className="kr-crest-line kr-crest-ring" />
      <g className="kr-crest-line">
        <path pathLength={1} className="kr-crest-steam" d="M78 92c-9-10 9-17 0-28s9-17 0-26" />
        <path pathLength={1} className="kr-crest-steam" d="M100 90c-9-10 9-17 0-28s9-17 0-26" />
        <path pathLength={1} className="kr-crest-steam" d="M122 92c-9-10 9-17 0-28s9-17 0-26" />
      </g>
      <path className="kr-crest-bowl" d="M42 104h116a58 58 0 0 1-116 0z" />
      <path pathLength={1} className="kr-crest-line kr-crest-foot" d="M80 166h40" />
      <g className="kr-crest-sticks">
        <path d="M128 98 174 42" />
        <path d="M138 101 182 50" />
      </g>
    </svg>
  );
}

/**
 * Shown only after a manual reload: a noren (shop-door curtain) hangs over the
 * page, its crest draws itself, then the cloth is pushed aside panel by panel.
 */
export default function ReloadCurtain() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !isReload()) return;
      const q = gsap.utils.selector(el);
      const panels = q(".kr-noren-panel");

      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            gsap.set(el, { display: "none" });
            finishCurtain();
          },
        })
        // the crest is printed on the hanging cloth
        .from(q(".kr-crest-disc"), { scale: 0.6, opacity: 0, transformOrigin: "50% 50%", duration: 0.55, ease: "back.out(1.6)" }, 0)
        .fromTo(q(".kr-crest-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, 0.15)
        .from(q(".kr-crest-bowl"), { yPercent: 18, opacity: 0, duration: 0.45 }, 0.3)
        .fromTo(q(".kr-crest-foot"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3 }, 0.55)
        .fromTo(
          q(".kr-crest-steam"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.55, ease: "power1.out", stagger: perCopy(STEAM, 0.08) },
          0.5,
        )
        .from(q(".kr-crest-sticks"), { x: 26, y: -26, opacity: 0, duration: 0.45 }, 0.6)
        .from(q(".kr-noren-char"), { yPercent: 140, duration: 0.45, stagger: perCopy(CHARS, 0.03) }, 0.35)
        // walked through: the panels part from the middle, swinging up and out of the way
        .to(
          panels,
          {
            yPercent: -112,
            rotation: (i) => SWING[i],
            duration: LIFT_DUR,
            ease: "power3.in",
            stagger: { each: 0.06, from: "center" },
          },
          RELOAD_REVEAL_AT,
        )
        // the middle panel lifts first; once it's fully up, the hero section starts
        .call(cueHero, [], RELOAD_REVEAL_AT + LIFT_DUR)
        .to(q(".kr-noren-rod"), { yPercent: -120, duration: 0.45, ease: "power2.in" }, RELOAD_REVEAL_AT + 0.5);

      el.removeAttribute("data-state");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="kr-curtain" data-state="pending" aria-hidden>
      {Array.from({ length: PANELS }, (_, i) => (
        <div key={i} className="kr-noren-panel" style={{ left: `${(i * 100) / PANELS}vw` }}>
          {/* the print spans the whole curtain; each panel shows its own slice of it */}
          <div className="kr-noren-print" style={{ left: `calc(${(-i * 100) / PANELS}vw - var(--seam))` }}>
            <Crest />
            <p className="kr-noren-word">
              {WORDS.map((word) => (
                <span key={word} className="kr-noren-line">
                  {[...word].map((ch, c) => (
                    <span key={c} className="kr-noren-char">
                      {ch}
                    </span>
                  ))}
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}
      <div className="kr-noren-rod" />
    </div>
  );
}
