"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Stepper } from "../cart/drawer";
import { FAQ } from "../data/faq";
import { useReveal } from "../sections/reveal";
import Segment from "../site/segment";

gsap.registerPlugin(useGSAP);

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const TIMES = ["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
const SEATS = [
  ["counter", "Counter"],
  ["table", "Table"],
  ["booth", "Booth"],
] as const;
type Seat = (typeof SEATS)[number][0];

type Day = { key: string; top: string; num: string };

function Accordion() {
  const [open, setOpen] = useState<number | null>(0);
  const body = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    body.current.forEach((el, i) => {
      if (el) gsap.to(el, { height: i === open ? "auto" : 0, opacity: i === open ? 1 : 0, duration: calm() ? 0 : 0.45, ease: "power3.inOut" });
    });
  }, [open]);

  return (
    <div className="kr-faq" data-reveal="group">
      {FAQ.map(([q, a], i) => (
        <div key={q} className={`kr-faq-item${open === i ? " is-open" : ""}`}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {q}
            <i aria-hidden />
          </button>
          <div
            ref={(el) => {
              body.current[i] = el;
            }}
            className="kr-faq-body"
          >
            <p>{a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Booking form beside a live paper ticket, which fills in as you choose (placeholder: nothing is sent). */
export default function Booking() {
  const scope = useRef<HTMLDivElement>(null);
  const ticket = useRef<HTMLDivElement>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [party, setParty] = useState(2);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("19:00");
  const [seat, setSeat] = useState<Seat>("counter");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  useReveal(scope);

  // dates come from the visitor's clock, so they're worked out in the browser
  useEffect(() => {
    const t = setTimeout(() => {
      const list = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          key: d.toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" }),
          top: i === 0 ? "Today" : d.toLocaleDateString("en", { weekday: "short" }),
          num: String(d.getDate()),
        };
      });
      setDays(list);
      setDay(list[0].key);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // the ticket gives a little nudge whenever a detail on it changes
  useEffect(() => {
    if (!calm()) gsap.fromTo(ticket.current, { rotation: -1.6 }, { rotation: 0, duration: 0.7, ease: "elastic.out(1.2, 0.35)" });
  }, [party, day, time, seat]);

  const pop = (e: MouseEvent<HTMLButtonElement>) => {
    if (!calm()) gsap.fromTo(e.currentTarget, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: "elastic.out(1.2, 0.4)" });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const bad = form.querySelector<HTMLInputElement>(":invalid");
      if (bad && !calm()) gsap.fromTo(bad, { x: 0 }, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.45 });
      bad?.focus();
      return;
    }
    setCode(`KR-${Math.floor(1000 + Math.random() * 9000)}`);
    if (!calm()) {
      gsap.timeline().to(ticket.current, { y: -14, rotation: 2, duration: 0.2, ease: "power2.out" }).to(ticket.current, { y: 0, rotation: 0, duration: 0.8, ease: "elastic.out(1.2, 0.4)" });
    }
  };

  return (
    <div ref={scope}>
      <section className="kr-sec kr-story kr-pat kr-pat-shippo kr-brush kr-brush-a">
        <div className="kr-wrap kr-book">
          <form className="kr-book-form" onSubmit={submit} noValidate data-reveal="group">
            <div className="kr-field-row">
              <div>
                <p className="kr-field-label">How many of you?</p>
                <Stepper value={party} label="guest" onChange={(n) => setParty(Math.min(12, Math.max(1, n)))} />
              </div>
              <div>
                <p className="kr-field-label">Where to sit?</p>
                <Segment value={seat} options={SEATS} label="Seating" onChange={setSeat} />
              </div>
            </div>

            <div>
              <p className="kr-field-label">Which day?</p>
              <div className="kr-chips-row">
                {days.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className="kr-day"
                    aria-pressed={d.key === day}
                    aria-label={d.key}
                    onClick={(e) => {
                      pop(e);
                      setDay(d.key);
                    }}
                  >
                    <small>{d.top}</small>
                    {d.num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="kr-field-label">What time?</p>
              <div className="kr-chips-row">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="kr-time"
                    aria-pressed={t === time}
                    onClick={(e) => {
                      pop(e);
                      setTime(t);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="kr-field-row">
              <label className="kr-field">
                <span>Your name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                <i aria-hidden />
              </label>
              <label className="kr-field">
                <span>Phone</span>
                <input required type="tel" autoComplete="tel" />
                <i aria-hidden />
              </label>
            </div>
            <label className="kr-field">
              <span>Anything we should know? (optional)</span>
              <input />
              <i aria-hidden />
            </label>

            <button type="submit" className="kr-btn kr-btn-dark">
              {code ? "Update my booking" : "Reserve my seat"}
            </button>
          </form>

          <div className="kr-ticket-wrap" data-reveal="up">
            <div ref={ticket} className="kr-ticket">
              <p className="kr-ticket-brand">Kaisen Ramen</p>
              <dl>
                <div>
                  <dt>Guests</dt>
                  <dd>{party}</dd>
                </div>
                <div>
                  <dt>Seat</dt>
                  <dd>{SEATS.find(([id]) => id === seat)?.[1]}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{day || "…"}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{time}</dd>
                </div>
                <div>
                  <dt>Name</dt>
                  <dd>{name || "…"}</dd>
                </div>
              </dl>
              <p className={`kr-ticket-code${code ? " is-on" : ""}`} role="status">
                {code ? `Reserved · ${code}` : "Not reserved yet"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="kr-sec kr-visit kr-pat kr-pat-waves kr-brush kr-brush-d">
        <div className="kr-wrap kr-faq-wrap">
          <h2 className="kr-h2" data-reveal="title">
            Good to know
          </h2>
          <Accordion />
        </div>
      </section>
    </div>
  );
}
