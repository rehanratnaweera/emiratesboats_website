import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { DIRECTUS_URL, type BoatModel } from "../cms";
import { privacyHref } from "../router";
import { COMPANY, SERVICE_DESK } from "../content/site";
import { SERVICES } from "../content/services";
import { msg, useI18n } from "../i18n";
import { revealDelay } from "../useScrollReveal";
import Turnstile, { type TurnstileHandle } from "./Turnstile";

/** Subjects stay in English as form values, so the yard always receives them in English. */
export const GENERAL_INTEREST = msg("General enquiry");
export const BESPOKE_INTEREST = msg("Bespoke build");

interface EnquiryState {
  interest: string;
  message: string;
  setInterest: (interest: string) => void;
  setMessage: (message: string) => void;
}

const EnquiryContext = createContext<EnquiryState | null>(null);

/** Holds the enquiry draft so any page can pre-select a subject before the visitor reaches the form. */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [interest, setInterest] = useState(GENERAL_INTEREST);
  const [message, setMessage] = useState("");
  const value = useMemo(() => ({ interest, message, setInterest, setMessage }), [interest, message]);
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return context;
}

/**
 * "verifying": the visitor pressed send before the background security check had
 * finished; the enquiry goes as soon as a token arrives.
 * "captcha-slow": the check produced no token in time while verifying.
 */
type SubmitStatus = "idle" | "verifying" | "submitting" | "succeeded" | "failed" | "captcha-slow" | "captcha-failed";

/** How long to wait for the background check before telling the visitor it is slow. */
const VERIFY_TIMEOUT_MS = 20_000;

/**
 * Public Cloudflare Turnstile site key. The widget's hostnames in Cloudflare must
 * include every domain the site is served from. The secret key lives only in Directus.
 */
const TURNSTILE_SITE_KEY = "0x4AAAAAAGQOen7U-GoaEmkc";

/**
 * The error code the Directus flow throws when Cloudflare rejects the token.
 * Matched in the error's code or message, so a visitor is told to redo the check
 * rather than that the enquiry failed.
 */
const CAPTCHA_ERROR = "CAPTCHA_FAILED";

class CaptchaRejected extends Error {}

interface DirectusErrorBody {
  errors?: { message?: unknown; extensions?: { code?: unknown } }[];
}

async function isCaptchaRejection(response: Response) {
  const body = (await response.json().catch(() => null)) as DirectusErrorBody | null;
  return (body?.errors ?? []).some(
    (error) => error?.extensions?.code === CAPTCHA_ERROR || String(error?.message ?? "").includes(CAPTCHA_ERROR),
  );
}

/** Fields the Directus `enquiries` collection requires. */
const REQUIRED_FIELDS = ["name", "email", "message"] as const;
/** The soft length limit set on the `message` field in Directus. */
const MESSAGE_MAX_LENGTH = 65554;

/**
 * Creates an item in the Directus `enquiries` collection; a Directus flow emails it to the yard.
 * A blocking Directus flow verifies `cf_token` with Cloudflare before the item is created.
 */
async function sendEnquiry(form: HTMLFormElement, captchaToken: string) {
  const data = new FormData(form);
  const field = (name: string) => String(data.get(name) ?? "").trim();
  const response = await fetch(`${DIRECTUS_URL}/items/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: field("name"),
      email: field("email"),
      // An empty string, not null, so the email flow shows a blank phone rather than "null".
      phone: field("phone"),
      interest: field("interest"),
      message: field("message"),
      cf_token: captchaToken,
    }),
  });
  if (response.ok) return;
  if (await isCaptchaRejection(response)) throw new CaptchaRejected();
  throw new Error(`Directus responded ${response.status}`);
}

function EnquiryForm({ boats }: { boats: BoatModel[] }) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaUnavailable, setCaptchaUnavailable] = useState(false);
  /** True while Cloudflare shows a challenge the visitor has to click. */
  const [challengeShown, setChallengeShown] = useState(false);
  const captcha = useRef<TurnstileHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  /** A token the server rejected is replaced and the enquiry re-sent once, without asking the visitor. */
  const retriedCaptcha = useRef(false);
  const { interest, message, setInterest, setMessage } = useEnquiry();
  const { t, rich, language } = useI18n();

  const handleCaptchaToken = useCallback((token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setCaptchaUnavailable(false);
      // "The check is slow" is out of date once it is complete. A rejection stays
      // on screen until the next submit, since a fresh token can arrive within a second.
      setStatus((current) => (current === "captcha-slow" ? "idle" : current));
    }
  }, []);
  const handleCaptchaUnavailable = useCallback(() => setCaptchaUnavailable(true), []);

  const submit = useCallback(async (token: string) => {
    const form = formRef.current;
    if (!form) return;
    setStatus("submitting");
    try {
      await sendEnquiry(form, token);
      setStatus("succeeded");
    } catch (error) {
      // Cloudflare accepts a token once, so any retry needs a fresh one.
      captcha.current?.reset();
      if (error instanceof CaptchaRejected && !retriedCaptcha.current) {
        retriedCaptcha.current = true;
        setStatus("verifying");
        return;
      }
      setStatus(error instanceof CaptchaRejected ? "captcha-failed" : "failed");
    }
  }, []);

  // Send pressed before the check finished: send as soon as the token arrives.
  useEffect(() => {
    if (status !== "verifying") return;
    if (captchaToken) {
      void submit(captchaToken);
      return;
    }
    if (captchaUnavailable) {
      setStatus("idle");
      return;
    }
    // The visitor is solving a challenge; give them all the time they need.
    if (challengeShown) return;
    const timer = window.setTimeout(() => setStatus("captcha-slow"), VERIFY_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status, captchaToken, captchaUnavailable, challengeShown, submit]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting" || status === "verifying") return;
    const form = event.currentTarget;
    // Required fields made only of spaces pass the browser's check, so trim them and validate again.
    for (const name of REQUIRED_FIELDS) {
      const input = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (input) input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;
    retriedCaptcha.current = false;
    if (captchaToken) {
      void submit(captchaToken);
    } else {
      setStatus("verifying");
    }
  }

  const busy = status === "verifying" || status === "submitting";

  if (status === "succeeded") {
    return (
      <div className="enquiry-success" role="status">
        <span className="enquiry-success-mark" aria-hidden="true" />
        <p className="enquiry-success-title">{t("Thank you. Your message is with us.")}</p>
        <p className="enquiry-success-copy">{t("Our team will reply within one business day.")}</p>
      </div>
    );
  }

  const known = [GENERAL_INTEREST, BESPOKE_INTEREST, ...boats.map((boat) => boat.name), ...SERVICES.map((service) => service.name)];

  return (
    <form className="enquiry-form" ref={formRef} onSubmit={handleSubmit}>
      <div className="enquiry-grid">
        <div className="field">
          <label htmlFor="enquiry-name">{t("Name")}</label>
          <input id="enquiry-name" type="text" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="enquiry-email">{t("Email")}</label>
          <input id="enquiry-email" type="email" name="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="enquiry-phone">
            {t("Phone")} <span>{t("Optional")}</span>
          </label>
          <input id="enquiry-phone" type="tel" name="phone" autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="enquiry-interest">{t("I'm interested in")}</label>
          <select id="enquiry-interest" name="interest" value={interest} onChange={(event) => setInterest(event.target.value)}>
            <option value={GENERAL_INTEREST}>{t(GENERAL_INTEREST)}</option>
            {boats.length > 0 && (
              <optgroup label={t("Fleet")}>
                {boats.map((boat) => (
                  <option key={boat.id}>{boat.name}</option>
                ))}
              </optgroup>
            )}
            <optgroup label={t("Build")}>
              <option value={BESPOKE_INTEREST}>{t(BESPOKE_INTEREST)}</option>
            </optgroup>
            <optgroup label={t("Services")}>
              {SERVICES.map((service) => (
                <option key={service.id} value={service.name}>
                  {t(service.name)}
                </option>
              ))}
            </optgroup>
            {!known.includes(interest) && <option value={interest}>{t(interest)}</option>}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="enquiry-message">{t("Message")}</label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX_LENGTH}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("Your boat, the model or service you have in mind, and your timing.")}
          required
        />
      </div>

      <Turnstile
        ref={captcha}
        siteKey={TURNSTILE_SITE_KEY}
        language={language.code}
        onToken={handleCaptchaToken}
        onUnavailable={handleCaptchaUnavailable}
        onInteractive={setChallengeShown}
      />

      {captchaUnavailable ? (
        <p className="field-error" role="alert">
          {t("The security check could not load. Please refresh the page, or call or email us directly.")}
        </p>
      ) : status === "verifying" && challengeShown ? (
        <p className="field-note" role="status">
          {t("Please complete the security check before sending.")}
        </p>
      ) : status === "captcha-slow" ? (
        <p className="field-error" role="alert">
          {t("The security check is taking longer than usual. Please wait a moment and send again, or call or email us directly.")}
        </p>
      ) : status === "captcha-failed" ? (
        <p className="field-error" role="alert">
          {t("The security check failed. Please complete it again, then send your enquiry.")}
        </p>
      ) : null}

      {status === "failed" && (
        <p className="field-error" role="alert">
          {t("Your enquiry could not be sent. Please try again, or call or email us directly.")}
        </p>
      )}

      <div className="enquiry-actions">
        <p>{t("We reply within one business day.")}</p>
        <button className="btn btn-gold" type="submit" disabled={busy} aria-busy={busy}>
          {busy && <span className="btn-spinner" aria-hidden="true" />}
          {status === "verifying" ? t("Verifying…") : status === "submitting" ? t("Sending…") : t("Send enquiry")}
        </button>
      </div>

      <p className="enquiry-privacy">
        {rich("We use your details only to reply to your enquiry. See our <link>privacy policy</link>.", {
          link: (text) => <a href={privacyHref()}>{text}</a>,
        })}
      </p>
    </form>
  );
}

interface EnquirySectionProps {
  boats: BoatModel[];
  title?: ReactNode;
  copy?: string;
}

export default function EnquirySection({ boats, title, copy }: EnquirySectionProps) {
  const { t } = useI18n();
  return (
    <section className="section theme-dark enquiry" id="contact">
      <div className="wrap enquiry-layout">
        <div className="enquiry-intro" data-reveal="">
          <p className="eyebrow">{t("Enquiries")}</p>
          <h2 className="display-2">{title ?? t("Begin the conversation.")}</h2>
          <p className="lede">
            {copy ?? t("A new build, a bespoke commission or work on the boat you already own — tell us what you have in mind and the right person will come back to you.")}
          </p>
          <dl className="contact-list">
            <div>
              <dt>{t("The yard")}</dt>
              <dd>
                {COMPANY.yard}
                <br />
                {COMPANY.postal}
                <br />
                <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
              </dd>
            </div>
            <div>
              <dt>{t("Engineering & Service department")}</dt>
              <dd>
                {SERVICE_DESK.name}
                <br />
                <a href={SERVICE_DESK.phoneHref}>{SERVICE_DESK.phone}</a>
                <br />
                <a href={`mailto:${SERVICE_DESK.email}`}>{SERVICE_DESK.email}</a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="enquiry-panel" data-reveal="" style={revealDelay(140)}>
          <EnquiryForm boats={boats} />
        </div>
      </div>
    </section>
  );
}
