import type { BoatModel } from "../cms";
import EnquirySection from "../components/Enquiry";
import PageHero from "../components/PageHero";
import { HYDRAULICS } from "../content/servicePages";
import { useI18n } from "../i18n";
import { revealDelay } from "../useScrollReveal";

export default function HydraulicsPage({ boats }: { boats: BoatModel[] }) {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        parent={{ id: "services", label: t("Services") }}
        current={t("Hydraulic swim platforms")}
        kicker={t(HYDRAULICS.kicker)}
        title={t(HYDRAULICS.title)}
        lede={t(HYDRAULICS.lede)}
        image={HYDRAULICS.hero}
        imageAlt={t(HYDRAULICS.heroAlt)}
      />

      <section className="section theme-light">
        <div className="wrap">
          <div className="intro-layout">
            <div data-reveal="">
              <p className="eyebrow">{t(HYDRAULICS.intro.kicker)}</p>
              <h2 className="display-2">{t(HYDRAULICS.intro.heading)}</h2>
            </div>
            <p className="intro-copy" data-reveal="" style={revealDelay(100)}>
              {t(HYDRAULICS.intro.copy)}
            </p>
          </div>
          <dl className="stat-row">
            {HYDRAULICS.stats.map((stat, index) => (
              <div key={stat.label} data-reveal="" style={revealDelay(index * 80)}>
                <dt>{t(stat.label)}</dt>
                <dd>{t(stat.value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section theme-dark">
        <div className="wrap">
          <header className="section-head is-split" data-reveal="">
            <div>
              <p className="eyebrow">{t("On the water")}</p>
              <h2 className="display-2">{t(HYDRAULICS.fitted.heading)}</h2>
            </div>
            <p className="section-head-note">{t(HYDRAULICS.fitted.copy)}</p>
          </header>
          <div className="photo-grid">
            {HYDRAULICS.fitted.photos.map((photo, index) => (
              <figure key={photo.src} data-reveal="" style={revealDelay((index % 2) * 110)}>
                <div className="photo-media">
                  <img src={photo.src} alt={t(photo.title)} loading="lazy" decoding="async" />
                </div>
                <figcaption>
                  <span className="photo-title">{t(photo.title)}</span>
                  <span className="photo-copy">{t(photo.copy)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section theme-light">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="eyebrow">{t("Why fit one")}</p>
            <h2 className="display-2">{t(HYDRAULICS.benefits.heading)}</h2>
          </header>
          <ul className="feature-grid" style={{ "--columns": 3 } as React.CSSProperties}>
            {HYDRAULICS.benefits.items.map((item, index) => (
              <li key={item.title} data-reveal="" style={revealDelay((index % 3) * 90)}>
                <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
                <p className="feature-title">{t(item.title)}</p>
                <p className="feature-copy">{t(item.copy)}</p>
              </li>
            ))}
          </ul>

          <div className="block">
            <header className="section-head is-split" data-reveal="">
              <div>
                <p className="eyebrow">{t("Supply & installation")}</p>
                <h2 className="display-2">{t(HYDRAULICS.brands.heading)}</h2>
              </div>
              <p className="section-head-note">{t(HYDRAULICS.brands.copy)}</p>
            </header>
            <div className="brand-grid">
              {HYDRAULICS.brands.items.map((brand, index) => (
                <article key={brand.name} data-reveal="" style={revealDelay(index * 100)}>
                  <p className="brand-detail">{t(brand.detail)}</p>
                  <h3 className="brand-name">{brand.name}</h3>
                  <p>{t(brand.copy)}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="process">
            <p className="eyebrow">{t("How we install")}</p>
            <ol className="process-steps" style={{ "--step-count": HYDRAULICS.process.length } as React.CSSProperties}>
              {HYDRAULICS.process.map((step, index) => (
                <li key={step} data-reveal="" style={revealDelay(index * 80)}>
                  <span className="process-number">{index + 1}</span>
                  <p className="process-title">{t(step)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <EnquirySection
        boats={boats}
        title={t("Specify your platform.")}
        copy={t("Tell us your boat's make, model and transom layout. We will check the structure, recommend the platform that fits and quote supply and installation.")}
      />
    </>
  );
}
