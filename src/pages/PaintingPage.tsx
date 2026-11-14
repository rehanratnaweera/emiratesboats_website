import { useState } from "react";
import type { BoatModel } from "../cms";
import EnquirySection, { useEnquiry } from "../components/Enquiry";
import PageHero from "../components/PageHero";
import { PAINT_FAMILIES, type PaintColor } from "../content/paintColors";
import { PAINTING } from "../content/servicePages";
import { SERVICE_PAGES } from "../content/services";
import { revealDelay } from "../useScrollReveal";

type Light = "golden" | "daylight";

const LIGHTS: Array<{ id: Light; label: string }> = [
  { id: "golden", label: "Golden hour" },
  { id: "daylight", label: "Daylight" },
];

const COLOR_COUNT = PAINT_FAMILIES.reduce((total, family) => total + family.colors.length, 0);

/** Pre-fills the enquiry form with a color reference; the link itself scrolls to the form. */
function useColorQuote() {
  const { setInterest, setMessage } = useEnquiry();
  return (name: string, ref: string) => {
    setInterest(SERVICE_PAGES.painting.interest);
    setMessage(`Color reference: ${name} (${ref})`);
  };
}

function FinishStudio() {
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
                alt={key === activeKey ? `EB 46 painted ${candidate.name}, ${option.label.toLowerCase()}` : ""}
                aria-hidden={key === activeKey ? undefined : true}
                decoding="async"
              />
            );
          }),
        )}
        <div className="studio-lights" role="group" aria-label="Lighting">
          {LIGHTS.map((option) => (
            <button key={option.id} type="button" aria-pressed={light === option.id} onClick={() => show(finish.id, option.id)}>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="studio-panel">
        <div className="studio-swatches" role="group" aria-label="Finish">
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
          <p className="studio-note">{finish.note}</p>
        </div>
        <a className="text-link" href="#contact" onClick={() => quote(finish.name, finish.ref)}>
          Quote this finish
        </a>
      </div>
    </div>
  );
}

function ColorLibrary() {
  const [selected, setSelected] = useState<PaintColor | null>(null);
  const quote = useColorQuote();

  return (
    <div className="library">
      <div className="library-families">
        {PAINT_FAMILIES.map((family) => (
          <section key={family.name} className="library-family" aria-label={family.name}>
            <h3>{family.name}</h3>
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
              Quote this color
            </a>
          </>
        ) : (
          <p className="library-bar-prompt">Select a color to see its name and reference.</p>
        )}
      </div>
    </div>
  );
}

export default function PaintingPage({ boats }: { boats: BoatModel[] }) {
  return (
    <>
      <PageHero parent={{ id: "services", label: "Services" }} current="Painting" kicker={PAINTING.kicker} title={PAINTING.title} lede={PAINTING.lede} />

      <section className="section theme-dark studio-section">
        <div className="wrap">
          <FinishStudio />
          <p className="studio-caption">{PAINTING.galleryNote}</p>
        </div>
      </section>

      <section className="section theme-light">
        <div className="wrap">
          <div className="two-up">
            {PAINTING.columns.map((column, index) => (
              <div key={column.heading} data-reveal="" style={revealDelay(index * 100)}>
                <h2 className="subhead">{column.heading}</h2>
                <p>{column.copy}</p>
              </div>
            ))}
          </div>
          <div className="callout" data-reveal="">
            <p className="eyebrow">{PAINTING.freedom.heading}</p>
            <p className="callout-copy">{PAINTING.freedom.copy}</p>
          </div>
        </div>
      </section>

      <section className="section theme-light library-section" id="colors">
        <div className="wrap">
          <header className="section-head is-split" data-reveal="">
            <div>
              <p className="eyebrow">Cromax® swatch library</p>
              <h2 className="display-2">{COLOR_COUNT} colors, named and referenced.</h2>
            </div>
            <p className="section-head-note">{PAINTING.libraryNote}</p>
          </header>
          <ColorLibrary />
          <p className="fine-print">{PAINTING.disclaimer}</p>
        </div>
      </section>

      <section className="section theme-dark">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="eyebrow">What's included</p>
            <h2 className="display-2">A factory finish, guaranteed.</h2>
          </header>
          <ul className="feature-grid" style={{ "--columns": 4 } as React.CSSProperties}>
            {PAINTING.features.map((feature, index) => (
              <li key={feature.title} data-reveal="" style={revealDelay(index * 90)}>
                <span className="feature-number">{String(index + 1).padStart(2, "0")}</span>
                <p className="feature-title">{feature.title}</p>
                <p className="feature-copy">{feature.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <EnquirySection
        boats={boats}
        title="Choose your color."
        copy="Send your boat model and the color reference you have in mind — or the shade you want matched — and we will survey, quote and schedule the work."
      />
    </>
  );
}
