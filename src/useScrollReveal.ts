import { useEffect } from "react";

/**
 * Fades/rises every `[data-reveal]` element the first time it scrolls into view,
 * including elements added later (route changes, CMS content arriving).
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
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    const observeAll = () => {
      document.querySelectorAll("[data-reveal]:not([data-revealed]):not([data-reveal-watched])").forEach((element) => {
        element.setAttribute("data-reveal-watched", "");
        observer.observe(element);
      });
    };

    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        observeAll();
      });
    });

    observeAll();
    mutations.observe(document.body, { childList: true, subtree: true });
    root.classList.add("reveal-ready");

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);
}

/** Stagger offset for elements marked with data-reveal. */
export function revealDelay(ms: number) {
  return { "--reveal-delay": `${ms}ms` } as React.CSSProperties;
}
