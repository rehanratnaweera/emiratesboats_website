import { useState } from "react";
import type { BoatModel } from "../cms";
import EnquirySection, { useEnquiry } from "../components/Enquiry";
import PageHero from "../components/PageHero";
import { PAINT_FAMILIES, type PaintColor } from "../content/paintColors";
import { PAINTING } from "../content/servicePages";
import { SERVICE_PAGES } from "../content/services";
import { msg, useI18n } from "../i18n";
import { revealDelay } from "../useScrollReveal";

type Light = "golden" | "daylight";

const LIGHTS: Array<{ id: Light; label: string }> = [
  { id: "golden", label: msg("Golden hour") },
  { id: "daylight", label: msg("Daylight") },
];

const COLOR_COUNT = PAINT_FAMILIES.reduce((total, family) => total + family.colors.length, 0);

/** Pre-fills the enquiry form with a color reference; the link itself scrolls to the form. */
function useColorQuote() {
  const { setInterest, setMessage } = useEnquiry();
  const { t } = useI18n();
  return (name: string, ref: string) => {
    setInterest(SERVICE_PAGES.painting.interest);
    setMessage(t("Color reference: {name} ({ref})", { name, ref }));
  };
}

function FinishStudio() {
  const { t } = useI18n();
  const [finishId, setFinishId] = useState(PAINTING.finishes[0].id);
  const [light, setLight] = useState<Light>("golden");
  // Renders are only requested once their finish or light has been chosen.
  const [seen, setSeen] = useState(() => new Set([`${PAINTING.finishes[0].id}:golden`]));
  const quote = useColorQuote();
  const finish = PAINTING.finishes.find((candidate) => candidate.id === finishId) ?? PAINTING.finishes[0];
  const activeKey = `${finish.id}:${light}`;

  const show = (nextFinish: string, nextLight: Light) => {
    setFinishId(nextFinish);
    setLight(nextLight);
    setSeen((current) => new Set(current).add(`${nextFinish}:${nextLight}`));
  };

  return (
    <div className="studio">
      <div className="studio-stage">
        {PAINTING.finishes.flatMap((candidate) =>
          LIGHTS.filter((option) => seen.has(`${candidate.id}:${option.id}`)).map((option) => {
            const key = `${candidate.id}:${option.id}`;
            return (
              <img
                key={key}
                className={key === activeKey ? "is-active" : ""}
                src={candidate[option.id]}
                alt={key === activeKey ? t("EB 46 painted {color}, {light}", { color: candidate.name, light: t(option.label) }) : ""}
                aria-hidden={key === activeKey ? undefined : true}
                decoding="async"
              />
            );
          }),
        )}
        <div className="studio-lights" role="group" aria-label={t("Lighting")}>
          {LIGHTS.map((option) => (
            <button key={option.id} type="button" aria-pressed={light === option.id} onClick={() => show(finish.id, option.id)}>
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="studio-panel">
        <div className="studio-swatches" role="group" aria-label={t("Finish")}>
          {PAINTING.finishes.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              className="studio-swatch"
              aria-pressed={candidate.id === finish.id}
              aria-label={candidate.name}
              title={candidate.name}
              onClick={() => show(candidate.id, light)}
            >
              <span style={{ background: candidate.hex }} />
            </button>
          ))}
        </div>
        <div className="studio-detail" aria-live="polite">
          <p className="studio-ref">{finish.ref}</p>
          <p className="studio-name">{finish.name}</p>
          <p className="studio-note">{t(finish.note)}</p>
        </div>
        <a className="text-link" href="#contact" onClick={() => quote(finish.name, finish.ref)}>
          {t("Quote this finish")}
        </a>
      </div>
    </div>
  );
}

function ColorLibrary() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<PaintColor | null>(null);
  const quote = useColorQuote();

  return (
    <div className="library">
      <div className="library-families">
        {PAINT_FAMILIES.map((family) => (
          <section key={family.name} className="library-family" aria-label={t(family.name)}>
            <h3>{t(family.name)}</h3>
            <ul>
              {family.colors.map((color) => (
                <li key={color.ref}>
                  <button
                    type="button"
                    className="swatch"
                    style={{ background: color.hex }}
                    aria-pressed={selected?.ref === color.ref}
                    aria-label={`${color.name}, ${color.ref}`}
                    title={`${color.name} · ${color.ref}`}
                    onClick={() => setSelected(color)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className={`library-bar${selected ? " is-active" : ""}`} aria-live="polite">
        {selected ? (
          <>
            <span className="library-bar-chip" style={{ background: selected.hex }} aria-hidden="true" />
            <p className="library-bar-detail">
              <span className="library-bar-name">{selected.name}</span>
              <span className="library-bar-ref">{selected.ref}</span>
            </p>
            <a className="btn btn-gold" href="#contact" onClick={() => quote(selected.name, selected.ref)}>
              {t("Quote this color")}
            </a>
          </>
        ) : (
          <p className="library-bar-prompt">{t("Select a color to see its name and reference.")}</p>
        )}
      </div>
    </div>
  );
}

export default function PaintingPage({ boats }: { boats: BoatModel[] }) {
  const { t } = useI18n();
  return (
    <>
      <PageHero
        parent={{ id: "services", label: t("Services") }}
        current={t("Painting")}
        kicker={t(PAINTING.kicker)}
        title={t(PAINTING.title)}
        lede={t(PAINTING.lede)}
      />

      <section className="section theme-dark studio-section">
        <div className="wrap">
          <FinishStudio />
          <p className="studio-caption">{t(PAINTING.galleryNote)}</p>
        </div>
      </section>

      <section className="section theme-light">
        <div className="wrap">
          <div className="two-up">
            {PAINTING.columns.map((column, index) => (
              <div key={column.heading} data-reveal="" style={revealDelay(index * 100)}>
                <h2 className="subhead">{t(column.heading)}</h2>
                <p>{t(column.copy)}</p>
              </div>
            ))}
          </div>
          <div className="callout" data-reveal="">
            <p className="eyebrow">{t(PAINTING.freedom.heading)}</p>
            <p className="callout-copy">{t(PAINTING.freedom.copy)}</p>
          </div>
        </div>
      </section>

      <section className="section theme-light library-section" id="colors">
        <div className="wrap">
          <header className="section-head is-split" data-reveal="">
            <div>
              <p className="eyebrow">{t("Cromax® swatch library")}</p>
              <h2 className="display-2">{t("{count} colors, named and referenced.", { count: COLOR_COUNT })}</h2>
            </div>
            <p className="section-head-note">{t(PAINTING.libraryNote)}</p>
          </header>
          <ColorLibrary />
          <p className="fine-print">{t(PAINTING.disclaimer)}</p>
        </div>
      </section>

      <section className="section theme-dark">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="eyebrow">{t("What's included")}</p>
            <h2 className="display-2">{t("A factory finish, guaranteed.")}</h2>
          </header>
          <ul className="feature-grid" style={{ "--columns": 4 } as React.CSSProperties}>
            {PAINTING.features.map((feature, index) => (
              <li key={feature.title} data-reveal="" style={revealDelay(index * 90)}>
                <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
                <p className="feature-title">{t(feature.title)}</p>
                <p className="feature-copy">{t(feature.copy)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EnquirySection
        boats={boats}
        title={t("Choose your color.")}
        copy={t("Send your boat model and the color reference you have in mind — or the shade you want matched — and we will survey, quote and schedule the work.")}
      />
    </>
  );
}
