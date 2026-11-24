import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

/**
 * Cloudflare Turnstile, rendered explicitly so React controls when the widget
 * appears, resets and goes away. The token it produces is checked by the
 * Directus flow that guards the `enquiries` collection; the browser never
 * decides on its own whether a visitor passed.
 */

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  language?: string;
  "response-field"?: boolean;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (code: string) => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi> | null = null;

/** Loads the Turnstile script once per page; a failed load can be retried by the next widget. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not initialise")));
    script.onerror = () => {
      script.remove();
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
}

/** Turnstile takes two-letter codes; Chinese needs a region to pick a script. */
function turnstileLanguage(code: string) {
  return code === "zh" ? "zh-cn" : code;
}

export interface TurnstileHandle {
  /** Gets a fresh token; call after every submission, because a token works only once. */
  reset: () => void;
}

interface TurnstileProps {
  siteKey: string;
  /** Site language code, so the widget speaks the same language as the page. */
  language: string;
  /** A usable token, or null while there is none (not solved yet, expired, failed, reset). */
  onToken: (token: string | null) => void;
  /** The script or the widget could not load, so no token will arrive until it recovers. */
  onUnavailable: () => void;
  ref?: Ref<TurnstileHandle>;
}

export default function Turnstile({ siteKey, language, onToken, onUnavailable, ref }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  // The widget is rendered once per language, so it reads the latest callbacks through a ref.
  const callbacks = useRef({ onToken, onUnavailable });
  callbacks.current = { onToken, onUnavailable };

  useImperativeHandle(ref, () => ({
    reset() {
      callbacks.current.onToken(null);
      if (widgetId.current !== undefined) window.turnstile?.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    callbacks.current.onToken(null);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: siteKey,
          theme: "dark",
          appearance: "interaction-only",
          size: "flexible",
          language: turnstileLanguage(language),
          // The token is sent in the JSON body, so the form needs no hidden input.
          "response-field": false,
          callback: (token) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onToken(null),
          "timeout-callback": () => callbacks.current.onToken(null),
          "error-callback": () => {
            callbacks.current.onToken(null);
            callbacks.current.onUnavailable();
          },
        });
      })
      .catch(() => {
        if (!cancelled) callbacks.current.onUnavailable();
      });

    return () => {
      cancelled = true;
      if (widgetId.current !== undefined) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey, language]);

  return <div className="enquiry-captcha" ref={container} />;
}
