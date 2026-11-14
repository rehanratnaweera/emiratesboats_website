import type { BoatModel } from "../cms";
import { SERVICE_PAGES } from "../content/services";
import { COMPANY, SERVICE_DESK } from "../content/site";
import { homeHref, modelHref, serviceHref } from "../router";

export default function SiteFooter({ boats, logoUrl }: { boats: BoatModel[]; logoUrl: string }) {
  return (
    <footer className="site-footer theme-dark">
      <div className="wrap">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <a href={homeHref()} aria-label="Emirates Boats — home">
              <img src={logoUrl} alt="Emirates Boats" width={740} height={339} loading="lazy" />
            </a>
            <p>High-performance center consoles and offshore catamarans, built and cared for in Dubai.</p>
          </div>

          <nav aria-label="Fleet">
            <p className="site-footer-heading">Fleet</p>
            <ul>
              {boats.map((boat) => (
                <li key={boat.id}>
                  <a href={modelHref(boat.slug)}>{boat.name}</a>
                </li>
              ))}
              <li>
                <a href={homeHref("fleet")}>All models</a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Services">
            <p className="site-footer-heading">Services</p>
            <ul>
              {Object.entries(SERVICE_PAGES).map(([slug, page]) => (
                <li key={slug}>
                  <a href={serviceHref(slug)}>{page.title}</a>
                </li>
              ))}
              <li>
                <a href={homeHref("services")}>All services</a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="site-footer-heading">The yard</p>
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
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved. Developed by{" "}
            <a href={COMPANY.developerHref} target="_blank" rel="noreferrer">
              {COMPANY.developer}
            </a>
            .
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
