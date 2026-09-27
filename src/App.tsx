import { useState, useEffect, useRef } from "react";
import BoatViewer from "./components/BoatViewer";
import BoatDetails from "./components/BoatDetails";
import ContactBox from "./components/contactbox";
import { fetchBoats, type BoatModel } from "./cmsfetch";

const SPEC_KEYS: Array<keyof BoatModel> = ["length", "beam", "displacement", "range", "power", "speed", "capacity", "construction"];
const SPEC_LABELS: Partial<Record<keyof BoatModel, string>> = {
  length: "LOA",
  beam: "Beam",
  displacement: "Displacement",
  range: "Range",
  power: "Propulsion",
  speed: "Speed",
  capacity: "Capacity",
  construction: "Construction",
};

export default function App() {
  const [boats, setBoats] = useState<BoatModel[]>([]);
  const [activeBoat, setActiveBoat] = useState<BoatModel | null>(null);
  const [boatsError, setBoatsError] = useState<string | null>(null);
  const [showBoatDetails, setShowBoatDetails] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fleetRef = useRef<HTMLDivElement>(null);
  const constructionRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const bespokeRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const contactRef: React.RefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBoats(controller.signal)
      .then((loadedBoats) => {
        setBoats(loadedBoats);
        setActiveBoat(loadedBoats[0] ?? null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBoatsError(error instanceof Error ? error.message : "Unable to load boats from the CMS.");
      });

    return () => controller.abort();
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  if (boatsError) return <div className="site-shell cms-status">Unable to load the fleet. {boatsError}</div>;
  if (!activeBoat) return <div className="site-shell cms-status">Loading the Emirates Boats fleet...</div>;

  return (
    <div className="site-shell">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className={`site-nav fixed top-0 left-0 right-0 z-50${navScrolled ? " is-scrolled" : ""}`}>
        <div className="site-nav-inner max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* wordmark */}
          <div className="site-wordmark flex items-center gap-3">
            <img src="https://cms.emirateboats.com/assets/b693203a-b37c-47ce-be08-2d9dfc9428ec" alt="Emirates Boats Logo" />
          </div>

          {/* desktop links */}
          <div className="site-nav-links hidden md:flex items-center gap-2">
            {["Our Fleet", "Construction", "Bespoke", "Contact"].map((l) => (
              <button
                key={l}
                onClick={() => {
                  if (l === "Our Fleet") scrollTo(fleetRef);
                  if (l === "Construction") scrollTo(constructionRef);
                  if (l === "Bespoke") scrollTo(bespokeRef);
                  if (l === "Contact") scrollTo(contactRef);
                }}
                className="site-nav-link"
              >
                {l}
              </button>
            ))}
          </div>

          <button
            className="site-nav-cta hidden md:block"
            onClick={() => scrollTo(contactRef)}
          >
            Enquire
          </button>

          <button className="site-menu-toggle md:hidden flex flex-col gap-1.5" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {[5, 5, 3].map((w, i) => (
              <span key={i} className="block h-px" style={{ width: `${w * 4}px`, background: "#3abbc4" }} />
            ))}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="site-mobile-menu md:hidden flex flex-col gap-2 px-6 pb-6">
            {["Our Fleet", "Construction", "Bespoke", "Contact"].map((l) => (
              <button key={l} className="site-nav-link site-nav-mobile-link text-left"
                onClick={() => { setMobileMenuOpen(false); 
                  if (l === "Our Fleet") scrollTo(fleetRef); 
                  if (l === "Construction") scrollTo(constructionRef); 
                  if (l === "Bespoke") scrollTo(bespokeRef); 
                  if (l === "Contact") scrollTo(contactRef);
                }}>
                {l}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero-section relative flex flex-col justify-end overflow-hidden" style={{ minHeight: "100svh" }}>
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover"
          src="https://cms.emirateboats.com/assets/044420c8-8e1e-4c11-8c2d-4de5cc24fb13"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="hero-overlay hero-overlay-bottom absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,18,30,0.25) 0%, rgba(7,18,30,0.1) 30%, rgba(7,18,30,0.7) 68%, rgba(7,18,30,1.0) 100%)" }} />
        <div className="hero-overlay hero-overlay-side absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(7,18,30,0.55) 0%, transparent 55%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 pt-28 w-full">
          <div className="max-w-lg">
            <p className="hero-kicker">
              Dubai · United Arab Emirates
            </p>
            <h1 className="hero-title">
              Purpose-built
              <br />
              <em>for the Gulf.</em>
            </h1>
            <p className="hero-copy">
              Emirates Boats LLC designs and builds high-performance center-console sport fishers and offshore catamarans — engineered for Gulf conditions, finished to international standards.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="primary-action" onClick={() => scrollTo(fleetRef)}>
                View the Fleet
              </button>
              <button className="secondary-action" onClick={() => scrollTo(constructionRef)}>
                Our Process
              </button>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="hero-stats relative z-10 w-full">
          <div className="hero-stats-grid max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              [String(boats.length), "Models Available"],
              ["46–80 ft", "Range"],
              ["Full Carbon", "Cat Construction"],
              ["Dubai", "Build Facility"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="stat-value">{val}</p>
                <p className="stat-label">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET / 3D VIEWER ───────────────────────────── */}
      <section className="fleet-section" ref={fleetRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="section-kicker">
                Current Lineup
              </p>
              <h2 className="section-title">
                Three models.
                <br />
                <em>No compromises.</em>
              </h2>
            </div>
            <p className="section-note">
              Drag to orbit · scroll to zoom.
            </p>
          </div>

          <div className="fleet-frame">
            <div className="fleet-layout grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)]">
              {/* selector */}
              <div className="boat-selector">
                {boats.map((boat) => (
                  <button
                    key={boat.id}
                    onClick={() => {
                      setActiveBoat(boat);
                    }}
                    className={`boat-option w-full text-left relative transition-colors duration-150${activeBoat.id === boat.id ? " is-active" : ""}`}
                  >
                    {activeBoat.id === boat.id && (
                      <span className="boat-option-indicator absolute left-0 top-0 bottom-0 w-0.5" />
                    )}
                    <p className="boat-option-name">
                      {boat.name}
                    </p>
                    <p className="boat-option-tagline">
                      {boat.tagline}
                    </p>
                  </button>
                ))}
              </div>

              {/* model and details pane */}
              <div className="fleet-pane flex flex-col">
                {showBoatDetails ? <BoatDetails boat={activeBoat} onBack={() => setShowBoatDetails(false)} /> : <>
                  {/* canvas */}
                  <div className="boat-model-canvas model-viewer-surface" style={{ position: "relative", flex: "1 1 auto" }}>
                  <BoatViewer
                    key={activeBoat.id}
                    modelUrl={activeBoat.modelUrl}
                    materialColors={activeBoat.materialColors}
                    zoomFactor={activeBoat.zoomFactor}
                  />
                  <div className="model-badge">
                    {activeBoat.name} — INTERACTIVE 3D MODEL
                  </div>
                  <div className="model-hint">
                    DRAG · ZOOM · ORBIT
                  </div>
                  </div>

                {/* specs */}
                <div className="specs-panel">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5 mb-6">
                    {SPEC_KEYS.map((k) => (
                      <div key={k}>
                        <p className="spec-label">
                          {SPEC_LABELS[k]}
                        </p>
                        <p className="spec-value">
                          {activeBoat[k] as string}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="boat-description">
                    {activeBoat.description}
                  </p>
                  <button
                    className="details-action"
                    onClick={() => setShowBoatDetails(true)}
                  >
                    View Gallery & Full Specs
                  </button>
                  </div>
                </>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSTRUCTION ────────────────────────────────── */}
      <section className="construction-section" ref={constructionRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="construction-image">
              <img
                src="https://images.unsplash.com/photo-1625183656263-171183307b15?w=900&h=600&fit=crop&auto=format"
                alt="High-speed center console boat underway"
                className="w-full h-full object-cover"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(4,13,23,0.5) 0%, transparent 65%)" }} />
            </div>
            <div>
              <p className="section-kicker">
                How We Build
              </p>
              <h2 className="section-title">
                Engineered for
                <br />
                <em>Gulf conditions</em>
              </h2>
              <p className="construction-copy">
                Every hull we build starts with a finite-element structural analysis for our specific sea state. The Gulf of Oman presents short, steep chop at 2–3 m that punishes inadequately reinforced transoms. Our center consoles use a 28° deep-V with longitudinal stringers bonded in carbon-loaded epoxy.
              </p>
              <p className="construction-copy">
                The EB Cat 80 is built entirely from carbon fiber — laid by hand in our Dubai facility, cured under vacuum, and inspected ultrasonically before the hulls are joined.
              </p>
            </div>
          </div>

          {/* process */}
          <div className="build-stages">
            <p className="section-kicker build-stages-heading">
              Build Stages
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { n: "01", t: "Hull Analysis", b: "FEA and CFD model run for Gulf sea states before a single layer of glass or carbon is cut." },
                { n: "02", t: "Lamination", b: "Pre-preg carbon (Cat 80) or infused vinylester (center consoles) laid in climate-controlled bays." },
                { n: "03", t: "Systems Fit-Out", b: "Electronics, rigging, fuel, and propulsion installed and independently certified before launch." },
                { n: "04", t: "Sea Trial", b: "Full-speed runs to rated maximum, instrument calibration, and customer handover in Dubai Marina." },
              ].map(({ n, t, b }) => (
                <div key={n} className="build-stage">
                  <span className="build-stage-number">{n}</span>
                  <p className="build-stage-title">{t}</p>
                  <p className="build-stage-copy">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────── */}
      <section className="gallery-section" ref={bespokeRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="gallery-grid grid grid-cols-3 gap-1.5">
            {[
              { url: "https://images.unsplash.com/photo-1552160757-52790c6f4faf?w=700&h=500&fit=crop&auto=format", alt: "Sport boat at speed" },
              { url: "https://images.unsplash.com/photo-1621459287809-d7b86ccf69f8?w=700&h=500&fit=crop&auto=format", alt: "Catamaran under sail" },
              { url: "https://images.unsplash.com/photo-1686048075764-996b3c825d7b?w=700&h=500&fit=crop&auto=format", alt: "Dubai marina" },
            ].map(({ url, alt }) => (
              <div key={url} className="gallery-tile">
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bespoke-section" ref={contactRef}>
        <div className="max-w-xl mx-auto text-center">
          <p className="section-kicker">
            Bespoke Programme
          </p>
          <h2 className="section-title">
            Have a specific
            <br />
            <em>brief in mind?</em>
          </h2>
          <p className="bespoke-copy">
            We take on bespoke commissions alongside our standard models. From an extended-range 55 ft center console to a custom 100 ft carbon cat — bring the spec, we'll build it.
          </p>
          <button className="primary-action" onClick={() => scrollTo(contactRef)}>
            Contact the Build Team
          </button>
          <ContactBox />
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <p className="footer-brand">Emirates Boats LLC</p>
              <p className="footer-location">Dubai, UAE</p>
              <p className="footer-address">
                Jebel Ali Industrial 1,<br />
                P.O. Box 212300,<br />
                +971 4 880 4777
              </p>
            </div>
            {[
              { h: "Fleet", links: ["EB-46 Center Console", "EB-63 Center Console", "EB Cat 80"], href: ["#", "#", "#"] },
              { h: "Company", links: ["About Us", "Instagram", "Facebook", "LinkedIn"], href: ["constructionRef", "https://www.instagram.com/emiratesboat", "https://www.facebook.com/emiratesboats", "https://www.linkedin.com/company/emirates-boats-llc"] },
              { h: "Services", links: ["Bespoke Builds", "Refit & Service", "Sea Trials", "Parts & Accessories"], href: ["#", "#", "#", "#"] },
            ].map(({ h, links, href }) => (
              <div key={h}>
                <p className="footer-heading">{h}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
                  {links.map((l, i) => (
                    <li key={l}>
                      <a className="footer-link" href={href[i]}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <p>© 2026 Emirates Boats LLC. All rights reserved.</p>
            <p>Designed and built with ❤️ by <a href="https://www.linkedin.com/in/rehanratnaweera">Rehan Rathnaweera</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
