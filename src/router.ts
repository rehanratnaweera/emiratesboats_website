import { useEffect, useSyncExternalStore } from "react";

/**
 * Minimal client-side routing on query parameters (`/?model=eb-63`,
 * `/?service=painting`). Every route is served by index.html, so deep links work
 * on any static host without rewrite rules.
 */
export type Route =
  | { page: "home" }
  | { page: "model"; slug: string }
  | { page: "service"; slug: string };

const BASE = import.meta.env.BASE_URL;

export function homeHref(sectionId?: string) {
  return sectionId ? `${BASE}#${sectionId}` : BASE;
}

export function modelHref(slug: string) {
  return `${BASE}?model=${encodeURIComponent(slug)}`;
}

export function serviceHref(slug: string) {
  return `${BASE}?service=${encodeURIComponent(slug)}`;
}

function parseRoute(search: string): Route {
  const params = new URLSearchParams(search);
  const model = params.get("model");
  if (model) return { page: "model", slug: model };
  const service = params.get("service");
  if (service) return { page: "service", slug: service };
  return { page: "home" };
}

export function routeKey(route: Route) {
  return route.page === "home" ? "home" : `${route.page}:${route.slug}`;
}

const listeners = new Set<() => void>();
let currentSearch = window.location.search;
let currentRoute = parseRoute(currentSearch);
/** Section to scroll to once the next page has rendered. */
let pendingHash = window.location.hash.slice(1);
/** True when the current route was reached with the browser's back/forward buttons. */
let cameFromHistory = false;

function sync() {
  if (window.location.search === currentSearch) return false;
  currentSearch = window.location.search;
  currentRoute = parseRoute(currentSearch);
  listeners.forEach((listener) => listener());
  return true;
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function scrollToSection(id: string, behavior: ScrollBehavior = scrollBehavior()) {
  if (!id || id === "top") {
    window.scrollTo({ top: 0, behavior });
    return true;
  }
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior, block: "start" });
  return true;
}

export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  const hash = url.hash.slice(1);
  if (url.search === window.location.search) {
    // Same page: just move to the section.
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    scrollToSection(hash || "top");
    return;
  }
  pendingHash = hash;
  cameFromHistory = false;
  window.history.pushState(null, "", url.pathname + url.search + url.hash);
  sync();
}

function onLinkClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
  event.preventDefault();
  navigate(anchor.href);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current route. Mount once near the root: it also wires up link interception. */
export function useRoute(): Route {
  const route = useSyncExternalStore(subscribe, () => currentRoute);

  useEffect(() => {
    const onPopState = () => {
      pendingHash = "";
      cameFromHistory = true;
      sync();
    };
    document.addEventListener("click", onLinkClick);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onLinkClick);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return route;
}

/** How the current route was reached: a section to land on, or a return through browser history (consumed once). */
export function takeArrival() {
  const arrival = { hash: pendingHash, fromHistory: cameFromHistory };
  pendingHash = "";
  cameFromHistory = false;
  return arrival;
}
