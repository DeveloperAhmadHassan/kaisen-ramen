"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { HOURS, type OpenStatus, openStatus } from "./hours";
import { MOTION_OK, useReveal } from "./reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

const WORDS = ["Kaisen", "Ramen"];
const LINKS = [
  ["Our story", "#story"],
  ["Menu", "#order"],
  ["Ramen across Japan", "#journey"],
  ["Build a bowl", "#build"],
  ["Visit", "#visit"],
];
// placeholder profiles: point these at the real accounts
const SOCIALS = [
  {
    label: "Instagram",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
      </>
    ),
  },
  { label: "TikTok", icon: <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.5 2.6 2.4 4.3 5 4.5" /> },
  { label: "LINE", icon: <path d="M12 4c5 0 9 3.1 9 7s-4 7-9 7l-4 3v-3.6C5 16.2 3 13.8 3 11c0-3.9 4-7 9-7z" /> },
];

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** "Open now" sign that reads the visitor's clock against the opening hours. */
function OpenSign() {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const check = () => setStatus(openStatus(new Date()));
    const first = setTimeout(check, 0);
    const every = setInterval(check, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, []);
  if (!status) return <p className="kr-open">&nbsp;</p>;
  return (
    <p className={`kr-open${status.open ? " is-open" : ""}`}>
      <span className="kr-open-dot" aria-hidden />
      {status.open ? `Open now · until ${status.until}` : `Closed · opens ${status.opens}`}
    </p>
  );
}

/** Noodle club signup (placeholder: nothing is sent yet). */
function Signup() {
  const [done, setDone] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const thanks = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!done || reduced()) return;
    gsap.from(thanks.current, { yPercent: 60, opacity: 0, rotation: -4, duration: 0.7, ease: "back.out(2)" });
  }, [done]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input")!;
    if (!input.checkValidity()) {
      // a little head-shake for an empty or malformed address
      if (!reduced()) gsap.fromTo(input, { x: 0 }, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.45, ease: "power1.out" });
      input.focus();
      return;
    }
    if (reduced()) {
      setDone(true);
      return;
    }
    gsap
      .timeline({ onComplete: () => setDone(true) })
      .to(form.current!.querySelector("button"), { scale: 0.85, duration: 0.12 })
      .to(form.current!.querySelector("button"), { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.4)" })
      .to(form.current, { y: -12, opacity: 0, duration: 0.3, ease: "power2.in" }, "-=0.25");
  };

  return done ? (
    // (no macron on the "o": the display font has no ō glyph)
    <p ref={thanks} className="kr-thanks" role="status">
      Arigato! You&apos;re on the list.
    </p>
  ) : (
    <form ref={form} className="kr-signup" onSubmit={submit} noValidate>
      <label className="kr-signup-field">
        <span className="kr-sr">Email address</span>
        <input type="email" required placeholder="you@email.com" autoComplete="email" />
        <span className="kr-signup-line" aria-hidden />
      </label>
      <button type="submit" className="kr-btn">
        Join
      </button>
    </form>
  );
}

/** Two noodle strands across the footer: they bend towards the cursor and twang back when it leaves. */
function Noodle() {
  const svg = useRef<SVGSVGElement>(null);
  const strands = useRef<(SVGPathElement | null)[]>([]);
  const pulls = useRef([
    { x: 500, y: 40 },
    { x: 500, y: 52 },
  ]);
  const rest = [40, 52];

  const draw = () =>
    pulls.current.forEach((p, i) =>
      strands.current[i]?.setAttribute("d", `M0 ${rest[i]} Q${p.x} ${2 * p.y - rest[i]} 1000 ${rest[i]}`),
    );

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (reduced()) return;
    const r = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 1000;
    const y = ((e.clientY - r.top) / r.height) * 92;
    pulls.current.forEach((p, i) =>
      gsap.to(p, { x, y: rest[i] + (y - rest[i]) * (i ? 0.75 : 1), duration: 0.25, ease: "power2.out", overwrite: true, onUpdate: draw }),
    );
  };
  const release = () => {
    pulls.current.forEach((p, i) =>
      gsap.to(p, { y: rest[i], duration: 1.6, ease: `elastic.out(1.2, ${i ? 0.18 : 0.22})`, overwrite: true, onUpdate: draw }),
    );
  };

  return (
    <svg ref={svg} className="kr-noodle" viewBox="0 0 1000 92" preserveAspectRatio="none" onPointerMove={move} onPointerLeave={release} aria-hidden>
      {rest.map((y, i) => (
        <path
          key={i}
          ref={(el) => {
            strands.current[i] = el;
          }}
          d={`M0 ${y} Q500 ${y} 1000 ${y}`}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/**
 * Footer: info columns, a noodle-club signup, a pluckable noodle, a giant
 * wordmark that ripples around the cursor.
 */
export default function Footer() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".kr-giant-char", {
          yPercent: 110,
          rotation: 8,
          duration: 1,
          ease: "power4.out",
          stagger: 0.05,
          scrollTrigger: { trigger: ".kr-giant", start: "top 92%", once: true },
        });
        gsap.from(".kr-noodle path", {
          strokeDasharray: "0 1200",
          duration: 1.4,
          ease: "power2.inOut",
          stagger: 0.15,
          scrollTrigger: { trigger: ".kr-noodle", start: "top 90%", once: true },
          clearProps: "strokeDasharray",
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  // letters near the cursor rise and lean away from it, like a ripple
  const ripple = (e: PointerEvent<HTMLElement>) => {
    if (reduced()) return;
    e.currentTarget.querySelectorAll<HTMLElement>(".kr-giant-char").forEach((ch) => {
      const r = ch.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const d = Math.min(1, Math.abs(dx) / (r.width * 2.5));
      const pull = 1 - d;
      gsap.to(ch, {
        yPercent: -22 * pull,
        rotation: (dx > 0 ? -1 : 1) * 10 * pull,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  };
  const settle = (e: PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget.querySelectorAll(".kr-giant-char"), {
      yPercent: 0,
      rotation: 0,
      duration: 0.9,
      ease: "elastic.out(1, 0.4)",
      stagger: 0.02,
    });

  const hop = (el: HTMLElement, on: boolean) => {
    if (reduced()) return;
    gsap.to(el.querySelector("svg"), {
      y: on ? -6 : 0,
      rotation: on ? 360 : 0,
      duration: on ? 0.6 : 0.3,
      ease: on ? "back.out(2)" : "power2.out",
      overwrite: true,
    });
  };

  const toTop = () => gsap.to(window, { scrollTo: 0, duration: reduced() ? 0 : 1.4, ease: "power3.inOut" });

  return (
    <footer ref={scope} className="kr-footer kr-pat kr-pat-kikko">
      <div className="kr-wrap">
        <div className="kr-foot-grid" data-reveal="group">
          <div className="kr-foot-col">
            <p className="kr-foot-brand">Kaisen Ramen</p>
            <p className="kr-foot-text">Slow broth, quick fire. Hand-pulled noodles and bowls built the way you like them.</p>
            <OpenSign />
          </div>
          <nav className="kr-foot-col" aria-label="Footer">
            <p className="kr-foot-title">Explore</p>
            <ul className="kr-foot-list">
              {LINKS.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="kr-foot-link">
                    <svg viewBox="0 0 16 10" aria-hidden>
                      <path d="M0 5h14M10 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="kr-foot-col">
            <p className="kr-foot-title">Hours</p>
            <ul className="kr-foot-list kr-foot-hours">
              {HOURS.map((h) => (
                <li key={h.label}>
                  <span>{h.label}</span>
                  <span>
                    {h.open}–{h.close}
                  </span>
                </li>
              ))}
            </ul>
            <p className="kr-foot-text">12 Noodle Lane, Food District</p>
          </div>
          <div className="kr-foot-col">
            <p className="kr-foot-title">Join the noodle club</p>
            <p className="kr-foot-text">New bowls, late-night specials and the odd secret menu, once a month.</p>
            <Signup />
          </div>
        </div>

        <Noodle />

        <div className="kr-giant-row">
          <p className="kr-giant" aria-label="Kaisen Ramen" onPointerMove={ripple} onPointerLeave={settle}>
            {WORDS.map((word, w) => (
              <span key={word} className="kr-giant-word" aria-hidden>
                {[...word].map((ch, i) => (
                  <span key={i} className={`kr-giant-char${w === 1 ? " is-accent" : ""}`}>
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </p>
        </div>

        <div className="kr-foot-row">
          <span>© Kaisen Ramen</span>
          <div className="kr-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                className="kr-social"
                aria-label={s.label}
                onClick={(e) => e.preventDefault()}
                onPointerEnter={(e) => hop(e.currentTarget, true)}
                onPointerLeave={(e) => hop(e.currentTarget, false)}
              >
                <svg viewBox="0 0 24 24" aria-hidden>
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>
          <button type="button" className="kr-top" aria-label="Back to top" onClick={toTop}>
            <svg viewBox="0 0 20 20" aria-hidden>
              <path d="M10 16V4M4 10l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
