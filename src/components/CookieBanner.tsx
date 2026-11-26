import { setAnalyticsConsent, useConsent } from "../consent";
import { useI18n } from "../i18n";
import { privacyHref } from "../router";

/**
 * Asks before Google Analytics sets any cookies. Declining is as easy as
 * accepting, and the choice can be changed from "Cookie settings" in the footer.
 */
export default function CookieBanner() {
  const { open, state } = useConsent();
  const { t, rich } = useI18n();
  if (!open) return null;

  return (
    <section className="cookie-banner theme-dark" role="region" aria-label={t("Cookie consent")}>
      <div className="cookie-banner-copy">
        <p className="cookie-banner-title">{t("Your privacy")}</p>
        <p>
          {rich(
            "We would like to use Google Analytics cookies to understand how visitors use this site, so we can improve it. They are only set if you accept. <link>Privacy & cookie policy</link>",
            { link: (text) => <a href={privacyHref()}>{text}</a> },
          )}
        </p>
        {state !== "unset" && (
          <p className="cookie-banner-status">
            {state === "granted" ? t("You currently allow analytics cookies.") : t("You currently decline analytics cookies.")}
          </p>
        )}
      </div>
      <div className="cookie-banner-actions">
        <button className="btn btn-outline" type="button" onClick={() => setAnalyticsConsent(false)}>
          {t("Decline")}
        </button>
        <button className="btn btn-gold" type="button" onClick={() => setAnalyticsConsent(true)}>
          {t("Accept")}
        </button>
      </div>
    </section>
  );
}
