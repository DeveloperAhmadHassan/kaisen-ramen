"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DROP_GARNISH, DROP_LOWER, box, sizes } from "./artboard";

gsap.registerPlugin(useGSAP);

// Four bowls sit 90deg apart on the tray: right (0), centre (90), left (180)
// and one parked off-screen at the top (270). Angles run clockwise on screen.
// Each bowl brings its own name and pair of garnishes, shown while it's centre.
const bowls = [
  {
    src: "/images/bowl-right.png",
    alt: "Miso ramen with charred chicken, corn and a soft egg",
    angle: 0,
    name: ["Miso", "Tori"],
    left: { src: "/images/garnish-egg-half.png", w: 786, h: 648 },
    right: { src: "/images/garnish-corn.png", w: 800, h: 601 },
  },
  {
    src: "/images/bowl-main.png",
    alt: "Spicy ramen with braised beef, kimchi and a jammy egg",
    angle: 90,
    name: ["Kara", "Tori"],
    left: { src: "/images/chicken.png", w: 706, h: 398 },
    right: { src: "/images/chili.png", w: 740, h: 363 },
  },
  {
    src: "/images/bowl-left.png",
    alt: "Chashu pork ramen with soft eggs, scallions and chili",
    angle: 180,
    name: ["Chashu", "Men"],
    left: { src: "/images/garnish-green-onion.png", w: 793, h: 800 },
    right: { src: "/images/garnish-mushroom.png", w: 800, h: 534 },
  },
  {
    src: "/images/bowl-top.png",
    alt: "Soba noodles in dashi with a raw egg yolk and leek",
    angle: 270,
    name: ["Tsukimi", "Soba"],
    left: { src: "/images/garnish-egg.png", w: 721, h: 800 },
    right: { src: "/images/garnish-leek.png", w: 800, h: 213 },
  },
];

const STEP = 90;
const START = bowls.findIndex((b) => b.angle === 90);

// Garnish slots (design px): x0, y0, x1 and the slot height; images fit inside.
// `m` is the portrait frame's box, tucked in beside the centre bowl's base.
const slots = {
  left: { x0: 6, y0: 374.4, x1: 128, h: 80, m: [214, 466, 300] },
  right: { x0: 650, y0: 355.3, x1: 794, h: 80, m: [496, 452, 588] },
} as const;
type Side = keyof typeof slots;

function centreIndex(rotation: number) {
  return bowls.findIndex((b) => (((b.angle + rotation) % 360) + 360) % 360 === 90);
}

// Path through the comp's bowl positions (design px): side bowls at y 62,
// the centre bowl at (403, 325). Bowls grow as they swing to the front.
// Each bowl is a BOWL_D box at the artboard origin, moved and sized with
// transforms only, so it stays on its own layer and nothing re-lays out.
const BOWL_D = 278;
const bowlBase = box(0, 0, BOWL_D);

function bowlPose(angle: number) {
  const t = (angle * Math.PI) / 180;
  const sin = Math.sin(t);
  const x = 385 + 291 * Math.cos(t) + 18 * sin;
  const y = 62 + 263 * sin;
  const d = 161 + 117 * Math.max(0, sin);
  return {
    xPercent: ((x - BOWL_D / 2) / BOWL_D) * 100,
    yPercent: ((y - BOWL_D / 2) / BOWL_D) * 100,
    scale: d / BOWL_D,
  };
}

function poseStyle(angle: number) {
  const p = bowlPose(angle);
  return { ...bowlBase, transform: `translate(${p.xPercent}%, ${p.yPercent}%) scale(${p.scale})` };
}

function Pennant({ side }: { side: "left" | "right" }) {
  return (
    <svg className="kr-pennant" viewBox="294 508 42 41" aria-hidden>
      <g transform={side === "left" ? undefined : "translate(630 0) scale(-1 1)"}>
        <polygon points="300,532 331,517.5 331,545.5" fill="rgba(70,4,6,0.45)" />
        <g stroke="#e9852f" strokeWidth="1.6" strokeLinecap="round" fill="none">
          <line x1="300" y1="532" x2="332.5" y2="516.5" />
          <line x1="300" y1="532" x2="331" y2="545.5" />
          <line x1="325.5" y1="512" x2="331" y2="545.5" />
        </g>
      </g>
    </svg>
  );
}

export default function RamenCarousel() {
  const scope = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLImageElement>(null);
  const bowlEls = useRef<(HTMLImageElement | null)[]>([]);
  const spin = useRef({ rotation: 0, target: 0 });
  const floats = useRef<Record<Side, HTMLDivElement | null>>({ left: null, right: null });
  const garnishEls = useRef<Record<Side, (HTMLDivElement | null)[]>>({ left: [], right: [] });
  const nameEls = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const s = spin.current;
      bowlEls.current.forEach((el, i) => {
        if (el) gsap.set(el, { x: 0, y: 0, rotation: 0, ...bowlPose(bowls[i].angle) });
      });
      // gentle bob, the two sides out of step with each other
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          floats.current.left,
          { yPercent: -5, rotation: -1.5 },
          { yPercent: 5, rotation: 1.5, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 },
        );
        gsap.fromTo(
          floats.current.right,
          { yPercent: 5, rotation: 1.5 },
          { yPercent: -5, rotation: -1.5, duration: 2.1, ease: "sine.inOut", yoyo: true, repeat: -1 },
        );
      });
      return () => {
        gsap.killTweensOf(s);
        mm.revert();
      };
    },
    { scope },
  );

  // swap the garnishes to the new centre bowl's pair: old ones drop away, new ones pop in
  const swapGarnishes = (next: number, dir: 1 | -1) => {
    (Object.keys(slots) as Side[]).forEach((side, k) => {
      garnishEls.current[side].forEach((el, i) => {
        if (!el) return;
        if (i === next) {
          gsap.fromTo(
            el,
            { autoAlpha: 0, scale: 0.5, yPercent: -30, rotation: dir * 30 },
            {
              autoAlpha: 1,
              scale: 1,
              yPercent: 0,
              rotation: 0,
              duration: 0.7,
              delay: 0.45 + k * 0.08,
              ease: "back.out(1.8)",
              overwrite: true,
            },
          );
        } else {
          // cancels a pop-in still waiting on its delay after a quick double click
          gsap.killTweensOf(el);
          if (Number(gsap.getProperty(el, "autoAlpha")) === 0) return;
          gsap.to(el, {
            autoAlpha: 0,
            scale: 0.5,
            yPercent: 30,
            rotation: -dir * 30,
            duration: 0.45,
            delay: k * 0.08,
            ease: "power2.in",
            overwrite: true,
          });
        }
      });
    });
  };

  // flip the dish name over letter by letter, rolling the way the tray turns
  const swapName = (next: number, dir: 1 | -1) => {
    nameEls.current.forEach((el, i) => {
      if (!el) return;
      const chars = el.querySelectorAll(".kr-char");
      gsap.killTweensOf(chars);
      if (i === next) {
        el.removeAttribute("aria-hidden");
        gsap.set(el, { visibility: "visible" });
        gsap.fromTo(
          chars,
          { yPercent: dir * 110, rotationX: -dir * 90, opacity: 0 },
          {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            duration: 0.55,
            delay: 0.4,
            ease: "back.out(1.6)",
            stagger: 0.035,
          },
        );
      } else if (el.style.visibility !== "hidden") {
        el.setAttribute("aria-hidden", "true");
        gsap.to(chars, {
          yPercent: -dir * 110,
          rotationX: dir * 90,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
          stagger: 0.025,
          onComplete: () => {
            gsap.set(el, { visibility: "hidden" });
          },
        });
      }
    });
  };

  // the pennants lean out, grow and warm up on hover/focus, and dip when pressed
  const hoverNav = (btn: HTMLElement, side: Side, on: boolean) => {
    const pennant = btn.querySelector(".kr-pennant");
    gsap.to(pennant, {
      xPercent: on ? (side === "left" ? -14 : 14) : 0,
      scale: on ? 1.18 : 1,
      duration: on ? 0.4 : 0.3,
      ease: on ? "back.out(2.2)" : "power2.out",
      overwrite: "auto",
    });
    gsap.to(btn.querySelectorAll(".kr-pennant line"), { stroke: on ? "#ffc06a" : "#e9852f", duration: 0.3 });
    gsap.to(btn.querySelector(".kr-pennant polygon"), {
      fill: on ? "rgba(233,133,47,0.45)" : "rgba(70,4,6,0.45)",
      duration: 0.3,
    });
  };

  const pressNav = (btn: HTMLElement, down: boolean) => {
    gsap.to(btn.querySelector(".kr-pennant"), {
      scale: down ? 0.92 : 1.18,
      duration: down ? 0.1 : 0.35,
      ease: down ? "power2.out" : "back.out(3)",
      overwrite: "auto",
    });
  };

  const turn = (dir: 1 | -1) => {
    const s = spin.current;
    s.target += dir * STEP;
    swapGarnishes(centreIndex(s.target), dir);
    swapName(centreIndex(s.target), dir);
    gsap.to(s, {
      rotation: s.target,
      duration: 1.1,
      ease: "power2.inOut",
      overwrite: true,
      onUpdate: () => {
        gsap.set(ring.current, { rotation: s.rotation });
        bowlEls.current.forEach((el, i) => {
          // bowls ride on the tray, so they turn with it as they travel
          if (el) gsap.set(el, { ...bowlPose(bowls[i].angle + s.rotation), rotation: s.rotation });
        });
      },
    });
  };

  return (
    <div ref={scope} className="kr-carousel">
      {/* the ring is a circle squashed to the comp's ellipse; it turns inside the squash */}
      <div className="kr-board" style={box(78, -234, 718)}>
        <div className="kr-board-squash">
          <Image
            ref={ring}
            src="/images/wood-ring.png"
            alt=""
            width={1280}
            height={1280}
            sizes={sizes(640)}
            loading="eager"
            className="kr-board-ring"
          />
        </div>
      </div>

      {bowls.map((bowl, i) => (
        <Image
          key={bowl.src}
          ref={(el) => {
            bowlEls.current[i] = el;
          }}
          src={bowl.src}
          alt={bowl.alt}
          width={1000}
          height={1000}
          sizes={sizes(BOWL_D)}
          preload={bowl.angle === 90}
          loading="eager"
          className="kr-piece kr-bowl"
          style={poseStyle(bowl.angle)}
        />
      ))}

      {(Object.keys(slots) as Side[]).map((side) => {
        const slot = slots[side];
        return (
          <div
            key={side}
            ref={(el) => {
              floats.current[side] = el;
            }}
            className="kr-float"
            style={{ ...box(slot.x0, slot.y0, slot.x1, slot.m, DROP_GARNISH), aspectRatio: `${slot.x1 - slot.x0} / ${slot.h}` }}
          >
            {bowls.map((bowl, i) => (
              <div
                key={bowl.src}
                ref={(el) => {
                  garnishEls.current[side][i] = el;
                }}
                className="kr-float-item"
                style={i === START ? undefined : { opacity: 0, visibility: "hidden" }}
              >
                <Image
                  src={bowl[side].src}
                  alt=""
                  fill
                  sizes={sizes(slot.x1 - slot.x0, slot.m[2] - slot.m[0])}
                  loading="eager"
                  className="kr-garnish"
                />
              </div>
            ))}
          </div>
        );
      })}

      <p className="kr-dish" aria-live="polite">
        {bowls.map((bowl, i) => (
          <span
            key={bowl.src}
            ref={(el) => {
              nameEls.current[i] = el;
            }}
            className="kr-dish-name"
            aria-hidden={i === START ? undefined : true}
            style={i === START ? undefined : { visibility: "hidden" }}
          >
            {bowl.name.map((line) => (
              <span key={line} className="kr-dish-line">
                {[...line].map((ch, c) => (
                  <span key={c} className="kr-char">
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </span>
        ))}
      </p>

      {(["left", "right"] as const).map((side) => (
        <button
          key={side}
          type="button"
          className="kr-nav"
          // the arrows drop with the lower group (80u) in the portrait frame
          style={side === "left" ? box(294, 508, 336, [294, 588, 336], DROP_LOWER) : box(466, 508, 508, [466, 588, 508], DROP_LOWER)}
          aria-label={side === "left" ? "Previous dish" : "Next dish"}
          onClick={() => turn(side === "left" ? -1 : 1)}
          onPointerEnter={(e) => hoverNav(e.currentTarget, side, true)}
          onPointerLeave={(e) => hoverNav(e.currentTarget, side, false)}
          onFocus={(e) => hoverNav(e.currentTarget, side, true)}
          onBlur={(e) => hoverNav(e.currentTarget, side, false)}
          onPointerDown={(e) => pressNav(e.currentTarget, true)}
          onPointerUp={(e) => pressNav(e.currentTarget, false)}
        >
          <Pennant side={side} />
        </button>
      ))}
    </div>
  );
}
