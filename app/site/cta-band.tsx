"use client";

import { useRef } from "react";
import Link from "next/link";
import { useReveal } from "../sections/reveal";

/** Closing band on inner pages: red that sinks into the footer's near-black. */
export default function CtaBand({ title, href, label }: { title: string; href: string; label: string }) {
  const scope = useRef<HTMLElement>(null);
  useReveal(scope);
  return (
    <section ref={scope} className="kr-sec kr-cta-band kr-visit kr-pat kr-pat-waves kr-brush kr-brush-d">
      <div className="kr-wrap">
        <h2 className="kr-h2" data-reveal="title">
          {title}
        </h2>
        <div data-reveal="up">
          <Link href={href} className="kr-btn kr-cta-link">
            {label}
          </Link>
        </div>
      </div>
    </section>
  );
}
