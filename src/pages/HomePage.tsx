import type { BoatModel } from "../cms";
import { SITE_MEDIA } from "../cms";
import EnquirySection, { BESPOKE_INTEREST, useEnquiry } from "../components/Enquiry";
import Figures from "../components/Figures";
import HeroVideo from "../components/HeroVideo";
import ServiceIndex from "../components/ServiceIndex";
import { SIGNATURE_IMAGES } from "../content/servicePages";
import { SERVICE_PROCESS, SERVICE_QUOTE, SERVICES_INTRO } from "../content/services";
import { BOAT_SHOW, BUILD_STAGES, SERVICE_DESK, boatShowIsCurrent } from "../content/site";
import { msg, useI18n, withBreaks } from "../i18n";
import { modelHref, serviceHref } from "../router";
import { revealDelay } from "../useScrollReveal";

export type FleetState = { status: "loading" } | { status: "error" } | { status: "ready"; boats: BoatModel[] };

const SIGNATURE = [
  {
    slug: "painting",
    eyebrow: msg("Painting & refinishing"),
    title: msg("240 Cromax® colors, or any shade you can name."),
    image: SIGNATURE_IMAGES.painting,
    alt: msg("EB 46 in a gunmetal grey finish at golden hour"),
  },
  {
    slug: "tooling",
    eyebrow: msg("Tooling Center"),
    title: msg("5-axis milling for plugs and molds up to 24 metres."),
    image: SIGNATURE_IMAGES.tooling,
    alt: msg("5-axis milling head machining a hull plug"),
  },
  {
    slug: "hydraulics",
    eyebrow: msg("Hydraulic swim platforms"),
    title: msg("Electro-hydraulic platforms, fitted at our yard."),
    image: SIGNATURE_IMAGES.hydraulics,
    alt: msg("Hydraulic swim platform around four outboard engines"),
  },
];

/** First sentence of a CMS description, for the fleet overview. */
function firstSentence(text: string) {
  const paragraph = text.split(/\n+/)[0]?.trim() ?? "";
  const match = paragraph.match(/^.*?[.!?](?=\s|$)/);
  return match ? match[0] : paragraph;
}

function FleetChapter({ boat, index }: { boat: BoatModel; index: number }) {
  const { t } = useI18n();
  const specs = [
    { label: t("Length"), value: boat.length },
    { label: t("Propulsion"), value: boat.power },
    { label: t("Speed"), value: boat.speed },
  ].filter((spec) => spec.value);

  return (
    <article className={`fleet-chapter${index % 2 ? " is-reversed" : ""}`}>
      <a className="fleet-chapter-media" href={modelHref(boat.slug)} tabIndex={-1} aria-hidden="true" data-reveal="">
        {boat.lead ? (
          <img src={boat.lead.medium} srcSet={boat.lead.srcSet} sizes="(min-width: 900px) 58vw, 100vw" alt="" loading="lazy" decoding="async" />
        ) : (
          <span className="fleet-chapter-placeholder">{boat.name}</span>
        )}
      </a>
      <div className="fleet-chapter-body" data-reveal="" style={revealDelay(120)}>
        <p className="fleet-chapter-index">
          <span>{String(index + 1).padStart(2, "0")}</span>
          {boat.tagline}
        </p>
        <h3 className="fleet-chapter-name">{boat.name}</h3>
        {boat.description && <p className="fleet-chapter-copy">{firstSentence(boat.description)}</p>}
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
        <a className="btn btn-outline" href={modelHref(boat.slug)}>
          {t("Discover the {name}", { name: boat.name })}
        </a>
      </div>
    </article>
  );
}

export default function HomePage({ fleet }: { fleet: FleetState }) {
  const boats = fleet.status === "ready" ? fleet.boats : [];
  const flagship = boats[0];
  const { setInterest } = useEnquiry();
  const { t, rich } = useI18n();
  const contactLink = (text: string) => <a href="#contact">{text}</a>;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero theme-dark">
        <HeroVideo src={SITE_MEDIA.heroVideo} poster={SITE_MEDIA.heroPoster} loopStart={2.2} loopEnd={22.6} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="wrap hero-content">
          <div className="hero-copy">
            <p className="eyebrow">{t("Dubai · United Arab Emirates")}</p>
            <h1 className="display-1">{withBreaks(t("Purpose-built\nfor the Gulf."))}</h1>
            <p className="lede">
              {t("Emirates Boats LLC designs, builds and cares for high-performance center consoles and offshore catamarans — engineered for Gulf conditions, finished to international standards.")}
            </p>
            <div className="actions">
              <a className="btn btn-gold" href="#fleet">
                {t("View the fleet")}
              </a>
              <a className="btn btn-outline" href="#services">
                {t("Our services")}
              </a>
            </div>
          </div>
          {boatShowIsCurrent() && (
            <aside className="show-notice" aria-label={t("Boat show")}>
              <p className="eyebrow">{t("Meet us at")}</p>
              <p className="show-notice-name">{t(BOAT_SHOW.name)}</p>
              <p className="show-notice-detail">
                {t(BOAT_SHOW.dates)}
                <br />
                {BOAT_SHOW.venue}
              </p>
            </aside>
          )}
        </div>
      </section>

      {/* ── Statement ────────────────────────────────────── */}
      <section className="section theme-light statement">
        <div className="wrap">
          <div className="statement-layout">
            <p className="eyebrow" data-reveal="">
              {t("The yard")}
            </p>
            <p className="statement-copy" data-reveal="" style={revealDelay(80)}>
              {t("Naval architecture, composite lamination, paint, electronics and joinery — every discipline behind an Emirates Boats hull works under one roof in Jebel Ali. We build the boat, and we look after it.")}
            </p>
          </div>
          {flagship && (
            <div className="statement-figures">
              <p className="eyebrow">{t("{name} · By the numbers", { name: flagship.name })}</p>
              <Figures boat={flagship} />
            </div>
          )}
        </div>
      </section>

      {/* ── Fleet ────────────────────────────────────────── */}
      <section className="section theme-dark fleet" id="fleet">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="eyebrow">{t("The fleet")}</p>
            <h2 className="display-2">{t("Built in Dubai. Proven offshore.")}</h2>
          </header>

          {fleet.status === "loading" && (
            <div className="fleet-chapter is-skeleton" role="status" aria-label={t("Loading the fleet")}>
              <div className="fleet-chapter-media" />
              <div className="fleet-chapter-body">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          {fleet.status === "error" && (
            <p className="fleet-notice" role="status">
              {rich("The fleet is not available right now. Please try again shortly, or <link>contact the yard</link> and we will send the details directly.", { link: contactLink })}
            </p>
          )}
          {fleet.status === "ready" && boats.length === 0 && (
            <p className="fleet-notice" role="status">
              {rich("New models are being prepared. <link>Contact the yard</link> for current availability.", { link: contactLink })}
            </p>
          )}
          {boats.map((boat, index) => (
            <FleetChapter key={boat.id} boat={boat} index={index} />
          ))}

          <div className="bespoke-note" data-reveal="">
            <p className="eyebrow">{t("Bespoke programme")}</p>
            <p className="bespoke-note-copy">
              {t("We take on bespoke commissions alongside our standard models. From an extended-range 55 ft center console to a custom 100 ft carbon cat — bring the spec, we'll build it.")}
            </p>
            <a className="text-link" href="#contact" onClick={() => setInterest(BESPOKE_INTEREST)}>
              {t("Discuss a commission")}
            </a>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      <section className="section theme-light services" id="services">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="eyebrow">{t("Service department")}</p>
            <h2 className="display-2">{t(SERVICES_INTRO.title)}</h2>
          </header>
          <div className="two-up">
            {SERVICES_INTRO.columns.map((column, index) => (
              <div key={column.heading} data-reveal="" style={revealDelay(index * 100)}>
                <h3 className="subhead">{t(column.heading)}</h3>
                <p>{t(column.copy)}</p>
              </div>
            ))}
          </div>

          <div className="services-index-head">
            <p className="eyebrow">{t("Twelve ways we care for your boat")}</p>
          </div>
          <ServiceIndex />

          <div className="process">
            <p className="eyebrow">{t("How we work")}</p>
            <ol className="process-steps" style={{ "--step-count": SERVICE_PROCESS.length } as React.CSSProperties}>
              {SERVICE_PROCESS.map((step, index) => (
                <li key={step.title} data-reveal="" style={revealDelay(index * 80)}>
                  <span className="process-number">{index + 1}</span>
                  <p className="process-title">{t(step.title)}</p>
                  <p className="process-copy">{t(step.copy)}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="quote-band" data-reveal="">
            <div>
              <p className="eyebrow">{t("Request a quote")}</p>
              <p className="quote-band-title">{t(SERVICE_QUOTE.title)}</p>
              <p className="quote-band-copy">{t(SERVICE_QUOTE.copy)}</p>
            </div>
            <div className="quote-band-contact">
              <a href={SERVICE_DESK.phoneHref}>{SERVICE_DESK.phone}</a>
              <a href={`mailto:${SERVICE_DESK.email}`}>{SERVICE_DESK.email}</a>
              <a className="btn btn-gold" href="#contact">
                {t("Send the details")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signature services ───────────────────────────── */}
      <section className="section theme-dark signature">
        <div className="wrap">
          <header className="section-head" data-reveal="">
            <p className="eyebrow">{t("In depth")}</p>
            <h2 className="display-2">{t("Three specialities of the yard.")}</h2>
          </header>
          <div className="signature-grid">
            {SIGNATURE.map((item, index) => (
              <a key={item.slug} className="signature-card" href={serviceHref(item.slug)} data-reveal="" style={revealDelay(index * 110)}>
                <span className="signature-card-media">
                  <img src={item.image} alt={t(item.alt)} loading="lazy" decoding="async" />
                </span>
                <span className="eyebrow">{t(item.eyebrow)}</span>
                <span className="signature-card-title">{t(item.title)}</span>
                <span className="text-link">{t("Explore")}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Craft ────────────────────────────────────────── */}
      <section className="section theme-light craft" id="craft">
        <div className="wrap">
          <div className="craft-layout">
            <div className="craft-media" data-reveal="">
              <img src={SITE_MEDIA.craft.url} alt={t(SITE_MEDIA.craft.alt)} loading="lazy" decoding="async" />
            </div>
            <div className="craft-body" data-reveal="" style={revealDelay(120)}>
              <p className="eyebrow">{t("How we build")}</p>
              <h2 className="display-2">{t("Engineered for Gulf conditions.")}</h2>
              <p>
                {t("Every hull we build starts with a finite-element structural analysis for our specific sea state. The Gulf of Oman presents short, steep chop at 2–3 m that punishes inadequately reinforced transoms. Our center consoles use a 28° deep-V with longitudinal stringers bonded in carbon-loaded epoxy.")}
              </p>
              <p>
                {t("The EB Cat 80 is built entirely from carbon fiber — laid by hand in our Dubai facility, cured under vacuum, and inspected ultrasonically before the hulls are joined.")}
              </p>
            </div>
          </div>

          <ol className="stages">
            {BUILD_STAGES.map((stage, index) => (
              <li key={stage.number} data-reveal="" style={revealDelay(index * 90)}>
                <span className="stage-number">{stage.number}</span>
                <p className="stage-title">{t(stage.title)}</p>
                <p className="stage-copy">{t(stage.copy)}</p>
              </li>
            ))}
          </ol>

          <div className="detail-strip">
            {SITE_MEDIA.craftDetails.map((detail, index) => (
              <div key={detail.url} data-reveal="" style={revealDelay(index * 110)}>
                <img src={detail.url} alt={t(detail.alt)} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <EnquirySection boats={boats} />
    </>
  );
}
