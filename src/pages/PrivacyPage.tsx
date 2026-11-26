import type { ReactNode } from "react";
import { openCookieSettings, useConsent } from "../consent";
import { COMPANY, PRIVACY_CONTACT } from "../content/site";
import { useI18n } from "../i18n";
import { homeHref } from "../router";

/** Change whenever the policy text changes. */
const LAST_UPDATED = new Date("2026-11-26T00:00:00+04:00");

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="legal-section">
      <h2 className="subhead">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  const { t, rich, language } = useI18n();
  const { state } = useConsent();
  const email = <a href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>;
  const updated = new Intl.DateTimeFormat(language.code, { dateStyle: "long" }).format(LAST_UPDATED);

  const cookies = [
    {
      name: "_ga",
      provider: "Google Analytics",
      purpose: t("Tells visits from different browsers apart, so we can count visitors."),
      duration: t("2 years"),
      needsConsent: true,
    },
    {
      name: "_ga_<ID>",
      provider: "Google Analytics",
      purpose: t("Keeps track of the current visit (session)."),
      duration: t("2 years"),
      needsConsent: true,
    },
    {
      name: "eb-cookie-consent",
      provider: COMPANY.name,
      purpose: t("Remembers whether you accepted or declined analytics cookies. Stored in your browser's local storage."),
      duration: t("1 year"),
      needsConsent: false,
    },
    {
      name: "eb-language",
      provider: COMPANY.name,
      purpose: t("Remembers the language you chose for the site. Stored in your browser's local storage."),
      duration: t("Until you clear it"),
      needsConsent: false,
    },
  ];

  return (
    <>
      <section className="legal-hero theme-dark">
        <div className="wrap">
          <nav className="crumbs" aria-label={t("Breadcrumb")}>
            <a href={homeHref()}>Emirates Boats</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{t("Privacy & cookie policy")}</span>
          </nav>
          <h1 className="display-2">{t("Privacy & cookie policy")}</h1>
          <p className="lede">{t("How we collect, use and protect personal information when you visit this website or send us an enquiry.")}</p>
          <p className="legal-updated">{t("Last updated: {date}", { date: updated })}</p>
        </div>
      </section>

      <div className="legal theme-light">
        <div className="wrap legal-body">
          <Section title={t("Who we are")}>
            <p>
              {t(
                "This website is run by {company}, {yard}, {postal}. We are responsible for the personal information collected through it.",
                { company: COMPANY.name, yard: COMPANY.yard, postal: COMPANY.postal },
              )}
            </p>
            <p>{rich("For any question about this policy or your information, email <email>address</email>.", { email: () => email })}</p>
          </Section>

          <Section title={t("What we collect")}>
            <ul>
              <li>
                {rich(
                  "<b>Enquiries.</b> When you use our enquiry form we receive your name, email address, phone number (if you give it), the subject you choose and your message.",
                  { b: (text) => <strong>{text}</strong> },
                )}
              </li>
              <li>
                {rich(
                  "<b>Analytics, only if you accept.</b> Google Analytics records the pages you view, how you arrived at the site, your device and browser type, and your approximate location (city or country). We do not use it to identify you, and advertising features are turned off.",
                  { b: (text) => <strong>{text}</strong> },
                )}
              </li>
              <li>
                {rich(
                  "<b>Technical data.</b> Like any website, the servers that deliver our pages, images and fonts receive your IP address and basic browser information in order to send them to you.",
                  { b: (text) => <strong>{text}</strong> },
                )}
              </li>
            </ul>
          </Section>

          <Section title={t("How we use it")}>
            <ul>
              <li>{t("To reply to your enquiry and, if you go ahead, to provide the boat or service you asked about.")}</li>
              <li>{t("To understand which pages are useful and improve the site, using analytics data, only with your consent.")}</li>
              <li>{t("To keep the site and our enquiry form secure and free of spam.")}</li>
            </ul>
            <p>{t("We do not sell your personal information or use it for advertising.")}</p>
          </Section>

          <Section title={t("Cookies and similar technologies")}>
            <p>
              {t(
                "Cookies are small files a website stores in your browser. We set Google Analytics cookies only after you click “Accept” in the cookie banner. The other items below are needed for the site to work as you expect and do not track you.",
              )}
            </p>
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th scope="col">{t("Name")}</th>
                    <th scope="col">{t("Provider")}</th>
                    <th scope="col">{t("Purpose")}</th>
                    <th scope="col">{t("Kept for")}</th>
                    <th scope="col">{t("Needs consent")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((cookie) => (
                    <tr key={cookie.name}>
                      <td>
                        <code>{cookie.name}</code>
                      </td>
                      <td>{cookie.provider}</td>
                      <td>{cookie.purpose}</td>
                      <td>{cookie.duration}</td>
                      <td>{cookie.needsConsent ? t("Yes") : t("No")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              {t(
                "Our enquiry form uses Cloudflare Turnstile to check that a person, not a bot, is sending it. Turnstile looks at signals from your browser to do this; it does not set advertising cookies.",
              )}
            </p>
            <p>
              {state === "granted"
                ? t("You currently allow analytics cookies.")
                : state === "denied"
                  ? t("You currently decline analytics cookies.")
                  : t("You have not made a choice about analytics cookies yet.")}{" "}
              {t("You can change your mind at any time.")}
            </p>
            <div className="actions">
              <button className="btn btn-outline" type="button" onClick={openCookieSettings}>
                {t("Cookie settings")}
              </button>
            </div>
          </Section>

          <Section title={t("Who we share it with")}>
            <p>{t("We use a small number of service providers who process information for us:")}</p>
            <ul>
              <li>{t("Google, for website analytics (only with your consent) and for the fonts used on the site.")}</li>
              <li>{t("Cloudflare, to protect our enquiry form from spam.")}</li>
              <li>{t("The providers that host this website and the system that stores and emails us your enquiries.")}</li>
            </ul>
            <p>
              {t(
                "Some of these providers may process information outside the United Arab Emirates, including in the United States and the European Union. Where they do, they are bound by contracts that require them to protect it.",
              )}
            </p>
            <p>{t("We may also disclose information where the law requires us to.")}</p>
          </Section>

          <Section title={t("How long we keep it")}>
            <ul>
              <li>{t("Enquiries: for as long as we need them to deal with your request and any work that follows, and to meet our legal and accounting obligations.")}</li>
              <li>{t("Analytics data: no longer than 14 months, after which Google deletes it automatically.")}</li>
            </ul>
          </Section>

          <Section title={t("Your rights")}>
            <p>
              {rich(
                "Depending on where you live, you may have the right to ask for a copy of the personal information we hold about you, to have it corrected or deleted, to object to or restrict how we use it, and to withdraw your consent at any time. To make a request, email <email>address</email>. We will reply within 30 days.",
                { email: () => email },
              )}
            </p>
            <p>
              {t(
                "If you are unhappy with how we have handled your information, you can complain to the data protection authority where you live, such as the UAE Data Office or, in the European Union, your national supervisory authority.",
              )}
            </p>
          </Section>

          <Section title={t("Changes to this policy")}>
            <p>{t("We may update this policy from time to time. The date at the top shows when it last changed.")}</p>
            <p>{t("This policy is written in English. If a translation differs from the English text, the English text applies.")}</p>
          </Section>
        </div>
      </div>
    </>
  );
}
