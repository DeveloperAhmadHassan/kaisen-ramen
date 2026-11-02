"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { MOTION_OK, useReveal } from "./reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// four regional styles, north to south (copy is placeholder-level: tweak freely)
const STOPS = [
  {
    city: "Sapporo",
    mark: "mountains" as const,
    region: "Hokkaidō",
    style: "Miso ramen",
    text: "Born in the snowy north: a rich, nutty miso broth, wok-tossed vegetables, sweet corn and a melting pat of butter.",
    bowl: "/images/bowl-right.png",
    garnish: { src: "/images/garnish-corn.png", w: 800, h: 601 },
  },
  {
    city: "Tokyo",
    mark: "tower" as const,
    region: "Kantō",
    style: "Shoyu ramen",
    text: "The capital's classic: a clear, soy-seasoned broth, wavy noodles, slices of chashu and a soft, jammy egg.",
    bowl: "/images/bowl-left.png",
    garnish: { src: "/images/garnish-egg-half.png", w: 786, h: 648 },
  },
  {
    city: "Kyoto",
    mark: "pagoda" as const,
    region: "Kansai",
    style: "Tsukimi soba",
    text: "Old-capital restraint: a delicate dashi, buckwheat noodles and a raw yolk floating like a full moon.",
    bowl: "/images/bowl-top.png",
    garnish: { src: "/images/garnish-green-onion.png", w: 793, h: 800 },
  },
  {
    city: "Hakata",
    mark: "torii" as const,
    region: "Fukuoka",
    style: "Spicy tonkotsu",
    text: "Kyushu's pride: pork bones boiled until the broth runs white, hair-thin noodles and a fiery chili kick.",
    bowl: "/images/bowl-main.png",
    garnish: { src: "/images/chili.png", w: 740, h: 363 },
  },
];

/** Pagoda tiers, widest at the bottom, each roof with upturned eaves. */
const PAGODA = Array.from({ length: 5 }, (_, k) => {
  const y = 186 - k * 31;
  const half = 70 - k * 9;
  const body = 44 - k * 5;
  return (
    `M${100 - body / 2} ${y}h${body}v-16h-${body}z` +
    `M${100 - half} ${y - 14}q8 2 16-4h${2 * half - 32}q8 6 16 4l-${half * 0.55} -14h-${2 * half - 2 * half * 0.55 - 4}z`
  );
}).join("") + "M98 22h4v14h-4z";

/** One landmark per stop, as a flat silhouette (fill: currentColor). */
function Landmark({ kind }: { kind: "mountains" | "tower" | "pagoda" | "torii" }) {
  return (
    <svg className="kr-stop-mark" viewBox="0 0 200 200" aria-hidden>
      {kind === "mountains" && (
        <path fill="currentColor" d="M0 200 38 122l14 14 26-48 22 26 24-56 30 54 14-12 32 54v46z" />
      )}
      {kind === "tower" && (
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M98 6h4l3 46h6v8h-5l6 44h10v10h-9l14 52 18 34h-24l-14-30H89l-14 30H51l18-34 14-52h-9v-10h10l6-44h-5v-8h6zM100 128l-10 36h20zM100 70l-5 32h10z"
        />
      )}
      {kind === "pagoda" && <path fill="currentColor" d={PAGODA} />}
      {kind === "torii" && (
        <path
          fill="currentColor"
          d="M8 46q92-26 184 0l-2 14q-90-22-180 0zM28 74h144v12H28zM94 58h12v16H94zM50 56h16v144H50zM134 56h16v144h-16z"
        />
      )}
    </svg>
  );
}

const SNOW = 28;

/** A bullet train in profile. */
function Train() {
  return (
    <svg className="kr-train" viewBox="0 0 120 34" aria-hidden>
      <path d="M4 28h86c14 0 24-6 28-12-8-7-22-12-40-12H10a6 6 0 0 0-6 6z" fill="#f4e7d2" />
      <path d="M4 22h96c6 0 12-2 16-6" fill="none" stroke="#e9852f" strokeWidth="3" />
      <path d="M78 7c12 1 21 4 27 8H80z" fill="#3d0306" />
      <g fill="#3d0306">
        <rect x="14" y="9" width="9" height="6" rx="1.5" />
        <rect x="28" y="9" width="9" height="6" rx="1.5" />
        <rect x="42" y="9" width="9" height="6" rx="1.5" />
        <rect x="56" y="9" width="9" height="6" rx="1.5" />
      </g>
      <circle cx="22" cy="30" r="3" fill="#2a1a14" />
      <circle cx="72" cy="30" r="3" fill="#2a1a14" />
    </svg>
  );
}

/**
 * Ramen across Japan: the section pins and the journey scrolls sideways, stop
 * by stop. A train rides the rail below and lights each station; each stop's
 * city name drifts behind in giant letters, its bowl spins up as it arrives
 * and its garnish floats past at its own speed.
 */
export default function Journey() {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const root = scope.current!;
        const q = gsap.utils.selector(root);
        const track = root.querySelector<HTMLElement>(".kr-journey-track")!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const pinVars = { trigger: ".kr-journey-pin", start: "top top", end: () => `+=${distance()}` };

        // the ride itself: scroll down, travel sideways
        const ride = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { ...pinVars, pin: true, scrub: 1, invalidateOnRefresh: true },
        });

        // the train runs the rail in step with the ride; the rail fills behind it
        const rail = root.querySelector<HTMLElement>(".kr-rail-line")!;
        // it turns around to face whichever way you're scrolling
        let facing = 1;
        gsap.to(".kr-train", {
          x: () => rail.offsetWidth,
          ease: "none",
          scrollTrigger: {
            ...pinVars,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (self.direction === facing) return;
              facing = self.direction;
              gsap.to(".kr-train", { scaleX: facing, duration: 0.35, ease: "back.out(2)" });
            },
          },
        });
        gsap.fromTo(".kr-rail-fill", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { ...pinVars, scrub: 1 } });
        // a little rattle on the rails
        gsap.to(".kr-train", { y: -1.5, duration: 0.12, ease: "sine.inOut", yoyo: true, repeat: -1 });

        // the "keep scrolling" hint nudges sideways until the ride starts
        gsap.to(".kr-hint-arrow", { x: 10, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });

        q(".kr-stop").forEach((stop, i) => {
          const across = { trigger: stop, containerAnimation: ride, start: "left right", end: "right left", scrub: true };
          const arrive = { trigger: stop, containerAnimation: ride, start: "left 60%", toggleActions: "play none none reverse" };
          const station = q(".kr-station")[i];

          // the city name drifts behind slower than the panel (parallax)
          gsap.fromTo(stop.querySelector(".kr-stop-big"), { xPercent: 25 }, { xPercent: -45, ease: "none", scrollTrigger: across });
          // the bowl spins the whole way across and swells as it reaches the middle
          gsap.fromTo(stop.querySelector(".kr-stop-bowl"), { rotation: -150 }, { rotation: 150, ease: "none", scrollTrigger: across });
          gsap.fromTo(
            stop.querySelector(".kr-stop-plate"),
            { scale: 0.55 },
            { keyframes: { scale: [0.55, 1, 0.55] }, ease: "none", scrollTrigger: across },
          );
          // the landmark rises up behind as the stop pulls in, then drifts slower than the panel
          gsap.fromTo(
            stop.querySelector(".kr-stop-mark"),
            { yPercent: 70, xPercent: 30 },
            { yPercent: 0, xPercent: -20, ease: "none", scrollTrigger: { ...across, end: "center center" } },
          );
          // the garnish floats past faster, tumbling
          gsap.fromTo(
            stop.querySelector(".kr-stop-garnish"),
            { xPercent: 160, yPercent: 40, rotation: -40 },
            { xPercent: -220, yPercent: -30, rotation: 50, ease: "none", scrollTrigger: across },
          );

          // arriving: title letters rise, words slide up, the station lights
          SplitText.create(stop.querySelector(".kr-stop-city"), {
            type: "chars",
            mask: "chars",
            onSplit: (self) =>
              gsap.from(self.chars, { yPercent: 110, duration: 0.7, ease: "power4.out", stagger: 0.04, scrollTrigger: arrive }),
          });
          gsap.from(stop.querySelectorAll(".kr-stop-copy > *"), {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: arrive,
          });
          ScrollTrigger.create({ ...arrive, onToggle: (self) => station?.classList.toggle("is-on", self.isActive || self.progress > 0) });
        });

        // snow over Sapporo: flakes drift down at their own pace, swaying
        q(".kr-snow i").forEach((flake) => {
          const fall = () => {
            const dur = gsap.utils.random(5, 11);
            gsap.set(flake, { left: `${gsap.utils.random(0, 100)}%`, y: 0, x: 0, scale: gsap.utils.random(0.4, 1.2), opacity: gsap.utils.random(0.3, 0.9) });
            gsap.to(flake, { y: window.innerHeight + 20, duration: dur, ease: "none", onComplete: fall });
            gsap.to(flake, { x: gsap.utils.random(-40, 40), duration: dur / 2, ease: "sine.inOut", yoyo: true, repeat: 1 });
          };
          gsap.delayedCall(gsap.utils.random(0, 8), fall);
        });

        // steam over every bowl, forever
        q(".kr-stop-steam path").forEach((path, i) => {
          gsap.fromTo(
            path,
            { strokeDasharray: "0 1", opacity: 0, y: 16 },
            { strokeDasharray: "1 0", opacity: 1, y: -8, duration: 2.2, delay: (i % 3) * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1, repeatDelay: 0.4 },
          );
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} className="kr-journey kr-pat kr-pat-kikko" id="journey" aria-label="Ramen across Japan">
      <div className="kr-journey-pin">
        <div className="kr-journey-track">
          <div className="kr-journey-intro">
            <h2 className="kr-h2" data-reveal="title">
              Ramen across Japan
            </h2>
            <p className="kr-lede" data-reveal="lines">
              From Sapporo&apos;s snowy miso to Hakata&apos;s pork-bone tonkotsu: one country, four great bowls. All
              aboard, and keep scrolling to ride along.
            </p>
            <p className="kr-hint" data-reveal="up">
              Keep scrolling
              <svg className="kr-hint-arrow" viewBox="0 0 40 14" aria-hidden>
                <path d="M0 7h36M30 1l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </p>
          </div>

          {STOPS.map((stop) => (
            <article key={stop.city} className="kr-stop">
              <span className="kr-stop-big" aria-hidden>
                {stop.city}
              </span>
              <Landmark kind={stop.mark} />
              {stop.mark === "mountains" && (
                <div className="kr-snow" aria-hidden>
                  {Array.from({ length: SNOW }, (_, i) => (
                    <i key={i} />
                  ))}
                </div>
              )}
              <div className="kr-stop-copy">
                <h3 className="kr-stop-city">{stop.city}</h3>
                <p className="kr-stop-style">
                  {stop.style} <span>· {stop.region}</span>
                </p>
                <p className="kr-stop-text">{stop.text}</p>
              </div>
              <div className="kr-stop-media">
                <div className="kr-stop-plate">
                  <svg className="kr-stop-steam" viewBox="0 0 120 120" aria-hidden>
                    <path pathLength={1} d="M30 110c-14-16 14-26 0-44s14-26 0-44" />
                    <path pathLength={1} d="M60 112c-14-16 14-26 0-44s14-26 0-44" />
                    <path pathLength={1} d="M90 110c-14-16 14-26 0-44s14-26 0-44" />
                  </svg>
                  <Image
                    src={stop.bowl}
                    alt={`${stop.style} from ${stop.city}`}
                    width={1000}
                    height={1000}
                    sizes="(max-width: 767px) 70vw, 36vw"
                    loading="eager"
                    className="kr-stop-bowl"
                  />
                </div>
                <Image
                  src={stop.garnish.src}
                  alt=""
                  width={stop.garnish.w}
                  height={stop.garnish.h}
                  sizes="160px"
                  className="kr-stop-garnish"
                />
              </div>
            </article>
          ))}
        </div>

        <div className="kr-rail" aria-hidden>
          <div className="kr-rail-line">
            <span className="kr-rail-fill" />
            {STOPS.map((stop, i) => (
              <span key={stop.city} className="kr-station" style={{ left: `${((i + 1) / STOPS.length) * 100}%` }}>
                <i />
                <b>{stop.city}</b>
              </span>
            ))}
            <Train />
          </div>
        </div>
      </div>
    </section>
  );
}
