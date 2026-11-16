import type { BoatModel } from "../cms";
import EnquirySection from "../components/Enquiry";
import Figures from "../components/Figures";
import Gallery from "../components/Gallery";
import { PAINTING } from "../content/servicePages";
import { msg, useI18n } from "../i18n";
import { homeHref, modelHref, serviceHref } from "../router";
import { revealDelay } from "../useScrollReveal";
import type { FleetState } from "./HomePage";
import NotFoundPage from "./NotFoundPage";

const SPEC_FIELDS: Array<{ label: string; key: keyof BoatModel }> = [
  { label: msg("Length overall"), key: "length" },
  { label: msg("Beam"), key: "beam" },
  { label: msg("Displacement"), key: "displacement" },
  { label: msg("Propulsion"), key: "power" },
  { label: msg("Speed"), key: "speed" },
  { label: msg("Range"), key: "range" },
  { label: msg("Capacity"), key: "capacity" },
  { label: msg("Construction"), key: "construction" },
];

function ModelSkeleton() {
  const { t } = useI18n();
  return (
    <section className="model-hero theme-dark is-skeleton" role="status" aria-label={t("Loading")}>
      <div className="wrap model-hero-content">
        <span />
        <span />
      </div>
    </section>
  );
}

export default function ModelPage({ slug, fleet }: { slug: string; fleet: FleetState }) {
  const { t } = useI18n();
  if (fleet.status === "loading") return <ModelSkeleton />;
  if (fleet.status === "error") {
    return (
      <NotFoundPage
        title={t("The fleet is not available right now.")}
        copy={t("We could not reach our catalogue. Please try again shortly, or contact the yard and we will send the details directly.")}
      />
    );
  }

  const boat = fleet.boats.find((candidate) => candidate.slug === slug);
  if (!boat) {
    return <NotFoundPage title={t("We couldn't find that model.")} copy={t("It may have been renamed or retired. The current fleet is one step away.")} />;
  }

  const others = fleet.boats.filter((candidate) => candidate.id !== boat.id);
  const paragraphs = boat.description.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const specs = SPEC_FIELDS.map((field) => ({ label: t(field.label), value: String(boat[field.key] ?? "") })).filter((spec) => spec.value);
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
          <nav className="crumbs" aria-label={t("Breadcrumb")}>
            <a href={homeHref("fleet")}>{t("Fleet")}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{boat.name}</span>
          </nav>
          {boat.tagline && <p className="eyebrow">{boat.tagline}</p>}
          <h1 className="display-1">{boat.name}</h1>
          <div className="actions">
            <a className="btn btn-gold" href="#contact">
              {t("Enquire about the {name}", { name: boat.name })}
            </a>
            {boat.datasheetUrl && (
              <a className="btn btn-outline" href={boat.datasheetUrl} download>
                {t("Download datasheet")}
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
              <p className="eyebrow">{t("Overview")}</p>
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <p key={index} className={index === 0 ? "overview-lead" : undefined}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="overview-lead">{t("Full details of the {name} are available from the yard on request.", { name: boat.name })}</p>
              )}
            </div>

            {(specs.length > 0 || boat.datasheetUrl) && (
              <div className="overview-specs" data-reveal="" style={revealDelay(120)}>
                <p className="eyebrow">{t("Specification")}</p>
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
                      <span className="datasheet-title">{t("{name} datasheet", { name: boat.name })}</span>
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
                <p className="eyebrow">{t("Gallery")}</p>
                <h2 className="display-2">{t("The {name} in detail.", { name: boat.name })}</h2>
              </div>
              <p className="section-head-note">{photoCount === 1 ? t("1 photograph") : t("{count} photographs", { count: photoCount })}</p>
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
            <p className="eyebrow">{t("Your color")}</p>
            <h2 className="display-2">{t("Finished the way you want it.")}</h2>
            <p>
              {t("Every {name} leaves our own paint facility. Choose from 240 Cromax® colors, or bring a RAL, Pantone or corporate reference and we will match it.", { name: boat.name })}
            </p>
            <a className="text-link" href={serviceHref("painting")}>
              {t("Explore the color library")}
            </a>
          </div>
          <ul className="paint-band-swatches" aria-label={t("Featured finishes")} data-reveal="" style={revealDelay(120)}>
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
              <p className="eyebrow">{t("Also in the fleet")}</p>
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
                    <span className="text-link">{t("Discover")}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <EnquirySection
        boats={fleet.boats}
        title={t("Enquire about the {name}.", { name: boat.name })}
        copy={t("Availability, specification, build slots and sea trials — tell us what you would like to know and the right person will come back to you.")}
      />
    </>
  );
}
