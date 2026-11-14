import { useEffect, useRef, useState } from "react";
import type { BoatModel } from "../cms";
import { performanceFacts, type Measure } from "../fleetFacts";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatMeasure(value: number, measure: Measure) {
  const number = value.toLocaleString("en-US", {
    minimumFractionDigits: measure.decimals,
    maximumFractionDigits: measure.decimals,
  });
  return `${number}${measure.suffix}`;
}

/** Becomes true once the element has scrolled into view, then stays true. */
function useRevealOnce<T extends Element>(threshold: number) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || revealed) return;
    if (!("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setRevealed(true);
        observer.disconnect();
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [revealed, threshold]);

  return [ref, revealed] as const;
}

function CountUp({ measure, run }: { measure: Measure; run: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      setValue(measure.value);
      return;
    }
    const duration = 1900;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(measure.value * (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [measure.value, run]);

  return <>{formatMeasure(value, measure)}</>;
}

/** Headline numbers parsed from a boat's CMS spec fields. Renders nothing if too few can be read. */
export default function Figures({ boat, animate = true }: { boat: BoatModel; animate?: boolean }) {
  const facts = performanceFacts(boat);
  const [ref, revealed] = useRevealOnce<HTMLDListElement>(0.3);

  if (facts.length < 2) return null;

  return (
    <dl ref={ref} className={`figures${revealed ? " is-revealed" : ""}`} style={{ "--figure-count": facts.length } as React.CSSProperties}>
      {facts.map((fact, index) => (
        <div key={fact.label} className="figure" style={{ transitionDelay: `${index * 110}ms` }}>
          <dt>{fact.label}</dt>
          <dd className="figure-number">
            <span aria-hidden="true">{animate ? <CountUp measure={fact.measure} run={revealed} /> : formatMeasure(fact.measure.value, fact.measure)}</span>
            <span className="sr-only">{formatMeasure(fact.measure.value, fact.measure)}</span>
            <small>{fact.measure.unit}</small>
          </dd>
          {fact.detail && <dd className="figure-detail">{fact.detail}</dd>}
        </div>
      ))}
    </dl>
  );
}
