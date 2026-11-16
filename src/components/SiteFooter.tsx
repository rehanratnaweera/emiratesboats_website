import type { BoatModel } from "../cms";
import { SERVICE_PAGES } from "../content/services";
import { COMPANY, SERVICE_DESK, DEVELOPER_INFO } from "../content/site";
import { useI18n } from "../i18n";
import { homeHref, modelHref, serviceHref } from "../router";

export default function SiteFooter({ boats, logoUrl }: { boats: BoatModel[]; logoUrl: string }) {
  const { t, rich } = useI18n();
  return (
    <footer className="site-footer theme-dark">
      <div className="wrap">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <a href={homeHref()} aria-label={t("Emirates Boats — home")}>
              <img src={logoUrl} alt="Emirates Boats" width={740} height={339} loading="lazy" />
            </a>
            <p>{t("High-performance center consoles and offshore catamarans, built and cared for in Dubai.")}</p>
          </div>

          <nav aria-label={t("Fleet")}>
            <p className="site-footer-heading">{t("Fleet")}</p>
            <ul>
              {boats.map((boat) => (
                <li key={boat.id}>
                  <a href={modelHref(boat.slug)}>{boat.name}</a>
                </li>
              ))}
              <li>
                <a href={homeHref("fleet")}>{t("All models")}</a>
              </li>
            </ul>
          </nav>

          <nav aria-label={t("Services")}>
            <p className="site-footer-heading">{t("Services")}</p>
            <ul>
              {Object.entries(SERVICE_PAGES).map(([slug, page]) => (
                <li key={slug}>
                  <a href={serviceHref(slug)}>{t(page.title)}</a>
                </li>
              ))}
              <li>
                <a href={homeHref("services")}>{t("All services")}</a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="site-footer-heading">{t("The yard")}</p>
            <ul>
              <li>{COMPANY.yard}</li>
              <li>{COMPANY.postal}</li>
              <li>
                <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SERVICE_DESK.email}`}>{SERVICE_DESK.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-base">
          <p>
            {rich(
              "© {year} {company}. All rights reserved. Developed by <link>{developer}</link>.",
              {
                link: (text) => (
                  <a href={DEVELOPER_INFO.href} target="_blank" rel="noreferrer">
                    {text}
                  </a>
                ),
              },
              { year: new Date().getFullYear(), company: COMPANY.name, developer: DEVELOPER_INFO.name },
            )}
          </p>
          <ul>
            {COMPANY.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
