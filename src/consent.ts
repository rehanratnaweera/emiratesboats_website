import { useSyncExternalStore } from "react";

/**
 * Cookie consent for Google Analytics.
 *
 * The GA snippet that vite.config.ts writes into index.html starts with every
 * Consent Mode signal denied and does not download gtag.js. Only when the visitor
 * accepts here is analytics_storage granted and the script loaded. On a later
 * visit the snippet reads the saved choice itself, so returning visitors who
 * accepted are measured from the first page view.
 *
 * Keep STORAGE_KEY, the stored format and CONSENT_MAX_AGE_MS in step with the
 * snippet in vite.config.ts.
 */

const STORAGE_KEY = "eb-cookie-consent";
/** A choice is asked again after a year. */
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

interface StoredConsent {
  analytics: boolean;
  /** When the choice was made, in ms since the epoch. */
  at: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    ebAnalytics?: { id: string; loaded?: boolean; load: () => void };
  }
}

/** False when the build has no Google Analytics ID: then there is nothing to consent to. */
export const analyticsEnabled = typeof window !== "undefined" && Boolean(window.ebAnalytics);

export type ConsentState = "unset" | "granted" | "denied";

function readStored(): ConsentState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as StoredConsent | null;
    if (!saved || typeof saved.at !== "number" || Date.now() - saved.at > CONSENT_MAX_AGE_MS) return "unset";
    return saved.analytics ? "granted" : "denied";
  } catch {
    return "unset";
  }
}

let state: ConsentState = readStored();
/** True while the visitor has the banner open again from "Cookie settings". */
let reopened = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Removes the Google Analytics cookies (_ga, _ga_<id>) from this host and its parent domains. */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid");
  const parts = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) domains.push(`; domain=.${parts.slice(i).join(".")}`);
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

export function setAnalyticsConsent(granted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: granted, at: Date.now() } satisfies StoredConsent));
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
  window.gtag?.("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
  if (granted) {
    window.ebAnalytics?.load();
  } else {
    clearAnalyticsCookies();
  }
  state = granted ? "granted" : "denied";
  reopened = false;
  emit();
}

/** Opens the banner again so the visitor can change their choice. */
export function openCookieSettings() {
  reopened = true;
  emit();
}

let snapshot = { state, open: analyticsEnabled && state === "unset" };

function getSnapshot() {
  const open = analyticsEnabled && (state === "unset" || reopened);
  if (snapshot.state !== state || snapshot.open !== open) snapshot = { state, open };
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The visitor's choice, and whether the banner should be showing. */
export function useConsent() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
