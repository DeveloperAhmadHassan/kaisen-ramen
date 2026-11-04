"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/** A pill-style choice with a highlight that slides to the selected option. */
export default function Segment<T extends string>({
  value,
  options,
  label,
  onChange,
}: {
  value: T;
  options: readonly (readonly [T, string])[];
  label: string;
  onChange: (v: T) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const on = root.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (on) gsap.to(pill.current, { x: on.offsetLeft, width: on.offsetWidth, duration: 0.45, ease: "power3.out" });
  }, [value]);

  return (
    <div ref={root} className="kr-segment" role="radiogroup" aria-label={label}>
      <span ref={pill} className="kr-segment-pill" aria-hidden />
      {options.map(([id, text]) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)}>
          {text}
        </button>
      ))}
    </div>
  );
}
