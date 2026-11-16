import { useState } from "react";
import { SERVICES } from "../content/services";
import { useI18n } from "../i18n";
import { serviceHref } from "../router";
import { useEnquiry } from "./Enquiry";

/** The twelve services as an accordion, with the open service's photograph alongside on wide screens. */
export default function ServiceIndex() {
  const [activeId, setActiveId] = useState(SERVICES[0].id);
  // Photographs are only requested once their service has been opened.
  const [seen, setSeen] = useState(() => new Set([SERVICES[0].id]));
  const { setInterest } = useEnquiry();
  const { t } = useI18n();

  const open = (id: string) => {
    setActiveId(id);
    setSeen((current) => (current.has(id) ? current : new Set(current).add(id)));
  };

  return (
    <div className="service-index">
      <ol className="service-list">
        {SERVICES.map((service, index) => {
          const isOpen = service.id === activeId;
          return (
            <li key={service.id} className={`service-item${isOpen ? " is-open" : ""}`}>
              <h3>
                <button
                  type="button"
                  id={`service-${service.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`service-panel-${service.id}`}
                  onClick={() => open(service.id)}
                >
                  <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="service-name">{t(service.name)}</span>
                  <span className="service-tagline">{t(service.tagline)}</span>
                  <span className="service-mark" aria-hidden="true" />
                </button>
              </h3>
              <div id={`service-panel-${service.id}`} className="service-panel" role="region" aria-labelledby={`service-${service.id}`} hidden={!isOpen}>
                <img className="service-panel-image" src={service.image} alt={t(service.imageAlt)} loading="lazy" decoding="async" />
                <p className="service-panel-tagline">{t(service.tagline)}</p>
                <ul>
                  {service.points.map((point) => (
                    <li key={point}>{t(point)}</li>
                  ))}
                </ul>
                <div className="service-panel-links">
                  {service.page && (
                    <a className="text-link" href={serviceHref(service.page)}>
                      {t("Explore in depth")}
                    </a>
                  )}
                  <a className="text-link" href="#contact" onClick={() => setInterest(service.name)}>
                    {t("Request a quote")}
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="service-visual" aria-hidden="true">
        {SERVICES.filter((service) => seen.has(service.id)).map((service) => (
          <img key={service.id} className={service.id === activeId ? "is-active" : ""} src={service.image} alt="" decoding="async" />
        ))}
      </div>
    </div>
  );
}
