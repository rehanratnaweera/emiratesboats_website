import type { BoatModel } from "../cms";
import EnquirySection from "../components/Enquiry";
import PageHero from "../components/PageHero";
import { TOOLING } from "../content/servicePages";
import { useI18n } from "../i18n";
import { revealDelay } from "../useScrollReveal";

export default function ToolingPage({ boats }: { boats: BoatModel[] }) {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        parent={{ id: "services", label: t("Services") }}
        current={t("Tooling Center")}
        kicker={t(TOOLING.kicker)}
        title={t(TOOLING.title)}
        lede={t(TOOLING.lede)}
        image={TOOLING.hero}
        imageAlt={t(TOOLING.heroAlt)}
      />

      <section className="theme-dark machine">
        <div className="wrap machine-layout">
          <div data-reveal="">
            <p className="eyebrow">{t(TOOLING.machine.kicker)}</p>
            <p className="machine-envelope">{TOOLING.machine.envelope}</p>
            <p className="machine-note">{t(TOOLING.machine.note)}</p>
          </div>
          <dl className="machine-axes" data-reveal="" style={revealDelay(120)}>
            {TOOLING.machine.axes.map((axis) => (
              <div key={axis.label}>
                <dt>{t(axis.label)}</dt>
                <dd>{axis.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section theme-light">
        <div className="wrap">
          <div className="two-up">
            {TOOLING.columns.map((column, index) => (
              <div key={column.heading} data-reveal="" style={revealDelay(index * 100)}>
                <h2 className="subhead">{t(column.heading)}</h2>
                <p>{t(column.copy)}</p>
              </div>
            ))}
          </div>

          <div className="block">
            <p className="eyebrow">{t("Six capabilities, one team")}</p>
            <ul className="feature-grid" style={{ "--columns": 3 } as React.CSSProperties}>
              {TOOLING.capabilities.map((capability, index) => (
                <li key={capability.title} data-reveal="" style={revealDelay((index % 3) * 90)}>
                  <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
                  <p className="feature-title">{t(capability.title)}</p>
                  <p className="feature-copy">{t(capability.copy)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section theme-dark">
        <div className="wrap">
          <header className="section-head is-split" data-reveal="">
            <div>
              <p className="eyebrow">{t("The process")}</p>
              <h2 className="display-2">{t("Twelve steps from file to mold.")}</h2>
            </div>
            <p className="section-head-note">{t(TOOLING.processNote)}</p>
          </header>
          <ol className="step-grid">
            {TOOLING.steps.map((step, index) => (
              <li key={step.number} data-reveal="" style={revealDelay((index % 3) * 90)}>
                <div className="step-media">
                  <img src={step.image} alt={t(step.alt)} loading="lazy" decoding="async" />
                </div>
                <span className="step-number">{step.number}</span>
                <p className="step-title">{t(step.title)}</p>
                <p className="step-copy">{t(step.copy)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section theme-light">
        <div className="wrap">
          <header className="section-head is-split" data-reveal="">
            <div>
              <p className="eyebrow">{t("Finished tooling")}</p>
              <h2 className="display-2">{t(TOOLING.molds.heading)}</h2>
            </div>
            <p className="section-head-note">{t(TOOLING.molds.copy)}</p>
          </header>
          <div className="mold-grid">
            {TOOLING.molds.images.map((image, index) => (
              <div key={image.src} data-reveal="" style={revealDelay((index % 2) * 110)}>
                <img src={image.src} alt={t(image.alt)} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnquirySection
        boats={boats}
        title={t("Send us your files.")}
        copy={t("Share your CAD model, the finish you need and your target date. Our technical office will prepare drawings, a bill of materials and a quotation.")}
      />
    </>
  );
}
