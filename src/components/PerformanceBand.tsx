import { useEffect, useRef, useState } from "react";
import type { BoatModel } from "../cmsfetch";
import { performanceFacts, type Measure } from "../fleetFacts";

interface PerformanceBandProps {
  boat: BoatModel;
  imageUrl: string;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatMeasure(value: number, measure: Measure) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: measure.decimals,
    maximumFractionDigits: measure.decimals,
  });
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

export default function PerformanceBand({ boat, imageUrl }: PerformanceBandProps) {
  const facts = performanceFacts(boat);
  const [contentRef, revealed] = useRevealOnce<HTMLDivElement>(0.3);

  if (facts.length < 2) return null;

  return (
    <section className={`performance-band${revealed ? " is-revealed" : ""}`} aria-labelledby="performance-title">
      <img className="performance-band-image" src={imageUrl} alt="" loading="lazy" decoding="async" />
      <div className="performance-band-shade" aria-hidden="true" />

      <div ref={contentRef} className="performance-band-content relative z-10 max-w-7xl mx-auto px-6">
        <p className="section-kicker">{boat.name} · By the numbers</p>
        <h2 id="performance-title" className="section-title performance-title">
          Gulf-proven <em>performance.</em>
        </h2>

        <dl className="performance-grid">
          {facts.map((fact, index) => (
            <div key={fact.label} className="performance-fact" style={{ transitionDelay: `${index * 120}ms` }}>
              <dt>{fact.label}</dt>
              <dd className="performance-figure">
                <span className="performance-value" aria-hidden="true">
                  <CountUp measure={fact.measure} run={revealed} />
                </span>
                <span className="sr-only">{formatMeasure(fact.measure.value, fact.measure)}</span>
                <span className="performance-unit">{fact.measure.unit}</span>
              </dd>
              {fact.detail && <dd className="performance-detail">{fact.detail}</dd>}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
