"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Stepper, Thumb } from "../cart/drawer";
import { DELIVERY_FEE, FREE_DELIVERY_AT, TAX_RATE, clearCart, money, setQty, subtotalOf, useCart } from "../cart/store";
import { MOTION_OK } from "../sections/reveal";
import Segment from "../site/segment";

gsap.registerPlugin(useGSAP);

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const MODES = [
  ["pickup", "Pickup"],
  ["delivery", "Delivery"],
] as const;
const PAY = [
  ["card", "Card"],
  ["later", "Pay on arrival"],
] as const;
const TIPS = [0, 10, 15, 20];
const PROMO = "RAMEN10"; // placeholder code, 10% off

type Placed = { code: string; mode: "pickup" | "delivery"; total: number; name: string };

/** A price that ticks to its new value. */
function Tick({ value, className }: { value: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: value });
  useEffect(() => {
    gsap.to(shown.current, {
      v: value,
      duration: calm() ? 0 : 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (el.current) el.current.textContent = money(shown.current.v);
      },
    });
  }, [value]);
  return (
    <span ref={el} className={className}>
      {money(value)}
    </span>
  );
}

function Field({ label, wide, ...input }: { label: string; wide?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`kr-field${wide ? " is-wide" : ""}`}>
      <span>{label}</span>
      <input {...input} />
      <i aria-hidden />
    </label>
  );
}

/** A card that fills in as you type and flips over for the security code. */
function CardForm() {
  const inner = useRef<HTMLDivElement>(null);
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const flip = (back: boolean) => gsap.to(inner.current, { rotationY: back ? 180 : 0, duration: calm() ? 0 : 0.7, ease: "power3.inOut" });

  return (
    <div className="kr-pay">
      <div className="kr-paycard" aria-hidden>
        <div ref={inner} className="kr-paycard-inner">
          <div className="kr-paycard-face">
            <span className="kr-paycard-chip" />
            <p className="kr-paycard-num">{number || "•••• •••• •••• ••••"}</p>
            <p className="kr-paycard-row">
              <span>{holder || "Your name"}</span>
              <span>{expiry || "MM/YY"}</span>
            </p>
          </div>
          <div className="kr-paycard-face kr-paycard-back">
            <span className="kr-paycard-strip" />
            <p className="kr-paycard-cvc">{cvc || "•••"}</p>
          </div>
        </div>
      </div>
      <div className="kr-fields">
        <Field
          wide
          label="Card number"
          required
          inputMode="numeric"
          autoComplete="cc-number"
          pattern="[0-9 ]{19}"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 "))}
        />
        <Field wide label="Name on card" required autoComplete="cc-name" value={holder} onChange={(e) => setHolder(e.target.value)} />
        <Field
          label="Expiry"
          required
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          pattern="[0-9]{2}/[0-9]{2}"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").slice(0, 4).replace(/(.{2})(?=.)/, "$1/"))}
        />
        <Field
          label="Security code"
          required
          inputMode="numeric"
          autoComplete="cc-csc"
          pattern="[0-9]{3,4}"
          value={cvc}
          onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onFocus={() => flip(true)}
          onBlur={() => flip(false)}
        />
      </div>
    </div>
  );
}

/** Order placed: the bowl spins up, steam rises and the tracker lights up in turn. */
function Confirmed({ order }: { order: Placed }) {
  const scope = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(".kr-done-bowl", { scale: 0, rotation: -220, duration: 1.2, ease: "back.out(1.5)" }, 0)
          .from(".kr-done-copy > *", { y: 40, opacity: 0, duration: 0.7, stagger: 0.09 }, 0.4)
          .from(".kr-track-fill", { scaleX: 0, duration: 1.2, ease: "power2.inOut" }, 1)
          .from(".kr-track li", { opacity: 0.35, duration: 0.3, stagger: 0.35 }, 1);
        gsap.to(".kr-done-bowl", { rotation: 360, duration: 40, ease: "none", repeat: -1, delay: 1.2 });
      });
      return () => mm.revert();
    },
    { scope },
  );
  return (
    <section ref={scope} className="kr-done kr-pat kr-pat-waves">
      <div className="kr-wrap kr-done-grid">
        <Image src="/images/bowl-main.png" alt="" width={1000} height={1000} sizes="(max-width: 860px) 70vw, 36vw" loading="eager" className="kr-done-bowl" />
        <div className="kr-done-copy">
          <h1 className="kr-h2">Arigato, {order.name.split(" ")[0]}!</h1>
          <p className="kr-lede">
            Order <strong>{order.code}</strong> is in. {order.mode === "pickup" ? "It'll be ready to collect in about 20 minutes." : "It'll be with you in about 35 minutes."}
          </p>
          <div className="kr-track">
            <span className="kr-track-fill" aria-hidden />
            <ol>
              <li>Received</li>
              <li>Simmering</li>
              <li>{order.mode === "pickup" ? "Ready" : "On the way"}</li>
            </ol>
          </div>
          <p className="kr-done-total">
            Total <strong>{money(order.total)}</strong>
          </p>
          <p className="kr-demo">This is a demo checkout: nothing was charged and no order was sent.</p>
          <Link href="/" className="kr-btn">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Checkout: delivery details and payment on the left, a live order summary on the right. */
export default function Checkout() {
  const { items, ready } = useCart();
  const scope = useRef<HTMLDivElement>(null);
  const address = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [pay, setPay] = useState<"card" | "later">("card");
  const [tip, setTip] = useState(10);
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState(false);
  const [promoMsg, setPromoMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const subtotal = subtotalOf(items);
  const discount = promo ? subtotal * 0.1 : 0;
  const delivery = mode === "delivery" && subtotal < FREE_DELIVERY_AT ? DELIVERY_FEE : 0;
  const tax = (subtotal - discount) * TAX_RATE;
  const tipAmount = (subtotal * tip) / 100;
  const total = subtotal - discount + delivery + tax + tipAmount;

  useGSAP(
    () => {
      if (!scope.current?.querySelector(".kr-co-grid")) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(".kr-co-title", { yPercent: 60, opacity: 0, duration: 0.8, ease: "power4.out" });
        gsap.from(".kr-co-block", { y: 40, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.09, delay: 0.1 });
        gsap.from(".kr-co-summary", { x: 60, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 });
      });
      return () => mm.revert();
    },
    { scope, dependencies: [ready] },
  );

  // the address field opens up for delivery
  useEffect(() => {
    if (address.current) gsap.to(address.current, { height: mode === "delivery" ? "auto" : 0, opacity: mode === "delivery" ? 1 : 0, duration: calm() ? 0 : 0.45, ease: "power3.inOut" });
  }, [mode]);

  const applyPromo = (e: MouseEvent<HTMLButtonElement>) => {
    const ok = code.trim().toUpperCase() === PROMO;
    setPromo(ok);
    setPromoMsg(ok ? "10% off applied" : "That code didn't work");
    if (!ok && !calm()) gsap.fromTo(e.currentTarget.parentElement, { x: 0 }, { keyframes: { x: [-8, 7, -5, 3, 0] }, duration: 0.4 });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const bad = form.querySelector<HTMLInputElement>("input:invalid");
      if (bad && !calm()) gsap.fromTo(bad.closest(".kr-field"), { x: 0 }, { keyframes: { x: [-10, 9, -6, 4, 0] }, duration: 0.45 });
      bad?.focus();
      return;
    }
    const name = new FormData(form).get("name") as string;
    setBusy(true);
    // stand-in for the real payment call
    setTimeout(() => {
      setPlaced({ code: `KR-${Math.floor(10000 + Math.random() * 90000)}`, mode, total, name });
      clearCart();
      window.scrollTo(0, 0);
    }, calm() ? 0 : 1100);
  };

  if (placed) return <Confirmed order={placed} />;

  return (
    <div ref={scope}>
      <section className="kr-co kr-pat kr-pat-waves">
        {!ready ? null : items.length === 0 ? (
          <div className="kr-wrap kr-co-empty">
            <h1 className="kr-h2">Your bowl is empty</h1>
            <p className="kr-lede">Add something tasty and come back.</p>
            <Link href="/menu" className="kr-btn">
              See the menu
            </Link>
          </div>
        ) : (
          <div className="kr-wrap">
            <h1 className="kr-h2 kr-co-title">Checkout</h1>
            <div className="kr-co-grid">
              <form id="kr-checkout" className="kr-co-form" onSubmit={submit} noValidate>
                <div className="kr-co-block">
                  <h2>How do you want it?</h2>
                  <Segment value={mode} options={MODES} label="Pickup or delivery" onChange={setMode} />
                  <div ref={address} className="kr-co-address" style={{ height: 0, opacity: 0, overflow: "hidden" }}>
                    {mode === "delivery" && (
                      <div className="kr-fields">
                        <Field wide label="Street address" name="street" required autoComplete="street-address" />
                        <Field label="City" name="city" required autoComplete="address-level2" />
                        <Field label="Postcode" name="postcode" required autoComplete="postal-code" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="kr-co-block">
                  <h2>Your details</h2>
                  <div className="kr-fields">
                    <Field wide label="Full name" name="name" required autoComplete="name" />
                    <Field label="Email" name="email" type="email" required autoComplete="email" />
                    <Field label="Phone" name="phone" type="tel" required autoComplete="tel" />
                  </div>
                </div>

                <div className="kr-co-block">
                  <h2>Payment</h2>
                  <Segment value={pay} options={PAY} label="Payment method" onChange={setPay} />
                  {pay === "card" ? <CardForm /> : <p className="kr-co-note">Pay by card or cash when you {mode === "pickup" ? "collect" : "get"} your order.</p>}
                </div>

                <div className="kr-co-block">
                  <h2>Tip the kitchen</h2>
                  <div className="kr-chips-row">
                    {TIPS.map((t) => (
                      <button key={t} type="button" className="kr-time" aria-pressed={t === tip} onClick={() => setTip(t)}>
                        {t ? `${t}%` : "No tip"}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <aside className="kr-co-summary" aria-label="Order summary">
                <h2>Your order</h2>
                <ul className="kr-lines">
                  {items.map((item) => (
                    <li key={item.id} className="kr-line">
                      <Thumb src={item.src} name={item.name} />
                      <div className="kr-line-info">
                        <strong>{item.name}</strong>
                        <span>{money(item.price * item.qty)}</span>
                        <Stepper value={item.qty} label={item.name} onChange={(n) => setQty(item.id, n)} />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="kr-promo">
                  <input aria-label="Promo code" placeholder="Promo code" value={code} onChange={(e) => setCode(e.target.value)} />
                  <button type="button" onClick={applyPromo}>
                    Apply
                  </button>
                </div>
                {promoMsg && (
                  <p className={`kr-promo-msg${promo ? " is-ok" : ""}`} role="status">
                    {promoMsg}
                  </p>
                )}
                <dl className="kr-sums">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>
                      <Tick value={subtotal} />
                    </dd>
                  </div>
                  {promo && (
                    <div>
                      <dt>Discount</dt>
                      <dd>
                        −<Tick value={discount} />
                      </dd>
                    </div>
                  )}
                  {mode === "delivery" && (
                    <div>
                      <dt>Delivery</dt>
                      <dd>{delivery ? money(delivery) : "Free"}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Tax</dt>
                    <dd>
                      <Tick value={tax} />
                    </dd>
                  </div>
                  <div>
                    <dt>Tip</dt>
                    <dd>
                      <Tick value={tipAmount} />
                    </dd>
                  </div>
                  <div className="is-total">
                    <dt>Total</dt>
                    <dd>
                      <Tick value={total} />
                    </dd>
                  </div>
                </dl>
                <button type="submit" form="kr-checkout" className="kr-btn kr-btn-wide" disabled={busy}>
                  {busy ? "Placing your order…" : "Place order"}
                </button>
                <p className="kr-demo">Demo checkout: no payment is taken and nothing is sent.</p>
              </aside>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
