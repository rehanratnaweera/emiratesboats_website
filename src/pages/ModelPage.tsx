import type { BoatModel } from "../cms";
import EnquirySection from "../components/Enquiry";
import Figures from "../components/Figures";
import Gallery from "../components/Gallery";
import { PAINTING } from "../content/servicePages";
import { homeHref, modelHref, serviceHref } from "../router";
import { revealDelay } from "../useScrollReveal";
import type { FleetState } from "./HomePage";
import NotFoundPage from "./NotFoundPage";

const SPEC_FIELDS: Array<{ label: string; key: keyof BoatModel }> = [
  { label: "Length overall", key: "length" },
  { label: "Beam", key: "beam" },
  { label: "Displacement", key: "displacement" },
  { label: "Propulsion", key: "power" },
  { label: "Speed", key: "speed" },
  { label: "Range", key: "range" },
  { label: "Capacity", key: "capacity" },
  { label: "Construction", key: "construction" },
];

function ModelSkeleton() {
  return (
    <section className="model-hero theme-dark is-skeleton" role="status" aria-label="Loading">
      <div className="wrap model-hero-content">
        <span />
        <span />
      </div>
    </section>
  );
}

export default function ModelPage({ slug, fleet }: { slug: string; fleet: FleetState }) {
  if (fleet.status === "loading") return <ModelSkeleton />;
  if (fleet.status === "error") {
    return <NotFoundPage title="The fleet is not available right now." copy="We could not reach our catalogue. Please try again shortly, or contact the yard and we will send the details directly." />;
  }

  const boat = fleet.boats.find((candidate) => candidate.slug === slug);
  if (!boat) {
    return <NotFoundPage title="We couldn't find that model." copy="It may have been renamed or retired. The current fleet is one step away." />;
  }

  const others = fleet.boats.filter((candidate) => candidate.id !== boat.id);
  const paragraphs = boat.description.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const specs = SPEC_FIELDS.map((field) => ({ label: field.label, value: String(boat[field.key] ?? "") })).filter((spec) => spec.value);
  const photoCount = boat.gallery.length;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="model-hero theme-dark">
        {boat.lead && (
          <img
            className="model-hero-image"
            src={boat.lead.large}
            srcSet={`${boat.lead.medium} 1280w, ${boat.lead.large} 2400w`}
            sizes="100vw"
            alt={boat.lead.alt}
            fetchPriority="high"
            decoding="async"
          />
        )}
        <div className="model-hero-shade" aria-hidden="true" />
        <div className="wrap model-hero-content">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href={homeHref("fleet")}>Fleet</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{boat.name}</span>
          </nav>
          {boat.tagline && <p className="eyebrow">{boat.tagline}</p>}
          <h1 className="display-1">{boat.name}</h1>
          <div className="actions">
            <a className="btn btn-gold" href="#contact">
              Enquire about the {boat.name}
            </a>
            {boat.datasheetUrl && (
              <a className="btn btn-outline" href={boat.datasheetUrl} download>
                Download datasheet
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Overview ─────────────────────────────────────── */}
      <section className="section theme-light model-overview">
        <div className="wrap">
          <Figures boat={boat} />

          <div className="overview-layout">
            <div className="overview-copy" data-reveal="">
              <p className="eyebrow">Overview</p>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "overview-lead" : undefined}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="overview-lead">Full details of the {boat.name} are available from the yard on request.</p>
              )}
            </div>

            {(specs.length > 0 || boat.datasheetUrl) && (
              <div className="overview-specs" data-reveal="" style={revealDelay(120)}>
                <p className="eyebrow">Specification</p>
                {specs.length > 0 && (
                  <dl className="spec-rows">
                    {specs.map((spec) => (
                      <div key={spec.label}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {boat.datasheetUrl && (
                  <a className="datasheet" href={boat.datasheetUrl} download>
                    <span>
                      <span className="datasheet-title">{boat.name} datasheet</span>
                      <span className="datasheet-meta">{boat.datasheetMeta}</span>
                    </span>
                    <span className="datasheet-mark" aria-hidden="true">
                      ↓
                    </span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────── */}
      {photoCount > 0 && (
        <section className="section theme-dark model-gallery">
          <div className="wrap">
            <header className="section-head is-split" data-reveal="">
              <div>
                <p className="eyebrow">Gallery</p>
                <h2 className="display-2">The {boat.name} in detail.</h2>
              </div>
              <p className="section-head-note">
                {photoCount} {photoCount === 1 ? "photograph" : "photographs"}
              </p>
            </header>
          </div>
          <div className="wrap is-wide">
            <Gallery images={boat.gallery} label={boat.name} />
          </div>
        </section>
      )}

      {/* ── Paint ────────────────────────────────────────── */}
      <section className="section theme-light paint-band">
        <div className="wrap paint-band-layout">
          <div data-reveal="">
            <p className="eyebrow">Your color</p>
            <h2 className="display-2">Finished the way you want it.</h2>
            <p>
              Every {boat.name} leaves our own paint facility. Choose from 240 Cromax® colors, or bring a RAL, Pantone or corporate reference and we will match it.
            </p>
            <a className="text-link" href={serviceHref("painting")}>
              Explore the color library
            </a>
          </div>
          <ul className="paint-band-swatches" aria-label="Featured finishes" data-reveal="" style={revealDelay(120)}>
            {PAINTING.finishes.map((finish) => (
              <li key={finish.id}>
                <span style={{ background: finish.hex }} />
                {finish.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Other models ─────────────────────────────────── */}
      {others.length > 0 && (
        <section className="section theme-light other-models">
          <div className="wrap">
            <header className="section-head" data-reveal="">
              <p className="eyebrow">Also in the fleet</p>
            </header>
            <div className="other-models-grid">
              {others.map((other, index) => (
                <a key={other.id} className="other-model" href={modelHref(other.slug)} data-reveal="" style={revealDelay(index * 110)}>
                  <span className="other-model-media">
                    {other.lead && <img src={other.lead.medium} srcSet={other.lead.srcSet} sizes="(min-width: 760px) 50vw, 100vw" alt="" loading="lazy" decoding="async" />}
                  </span>
                  <span className="other-model-body">
                    <span className="eyebrow">{other.tagline}</span>
                    <span className="other-model-name">{other.name}</span>
                    <span className="text-link">Discover</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <EnquirySection
        boats={fleet.boats}
        title={`Enquire about the ${boat.name}.`}
        copy="Availability, specification, build slots and sea trials — tell us what you would like to know and the right person will come back to you."
      />
    </>
  );
}
