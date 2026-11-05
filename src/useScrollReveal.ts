import { useEffect } from "react";

/**
 * Fades/rises every `[data-reveal]` element the first time it scrolls into view.
 * Elements stay visible if JS or IntersectionObserver is unavailable, because the
 * hidden starting state only applies under `.reveal-ready` (added here).
 */
export function useScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    root.classList.add("reveal-ready");

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
}
