import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import BoatViewer from "./components/BoatViewer";
import BoatDetails from "./components/BoatDetails";
import ContactBox from "./components/contactbox";
import { fetchBoats, type BoatConfigurationGroup, type BoatModel } from "./cmsfetch";

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

const FALLBACK_BOAT: BoatModel = {
  id: "fallback-eb-63",
  name: "EB-63",
  tagline: "63 ft · Center Console",
  modelUrl: "",
  datasheetUrl: "",
  gallery: [],
  materialColors: {},
  configurationGroups: [],
  zoomFactor: 1,
  length: "63 ft / 19.2 m",
  beam: "13 ft / 4 m",
  displacement: "15 tons",
  range: "1,200 nm",
  power: "6 x Mercury 500R",
  speed: "82 mph MAX / 60 mph Cruise",
  capacity: "16 persons",
  construction: "Carbon fiber E-Glass Composite",
  description: "A high-performance offshore center console designed for long-range Gulf conditions, with a stepped composite hull, overnight accommodation, and premium navigation systems.",
};

function LoadingStatus({ progress, visible }: { progress: number; visible: boolean }) {
  const value = Math.max(0, Math.min(100, progress));

  if (!visible) return null;

  return (
    <div className={`config-loading${value >= 100 ? " is-complete" : ""}`} aria-live="polite" aria-label={`Loading 3D assets: ${Math.round(value)} percent`}>
      <p>Loading 3D assets<span>{Math.round(value)}%</span></p>
      <div className="config-loading-track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function defaultOptionIds(group: BoatConfigurationGroup) {
  const defaults = group.options.filter((option) => option.isDefault).map((option) => option.id);
  return group.selectionMode === "single" ? defaults.slice(0, 1) : defaults;
}

export default function App() {
  const [boats, setBoats] = useState<BoatModel[]>([FALLBACK_BOAT]);
  const [activeBoat, setActiveBoat] = useState<BoatModel | null>(FALLBACK_BOAT);
  const [boatsError, setBoatsError] = useState<string | null>(null);
  const [showBoatDetails, setShowBoatDetails] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [modelProgress, setModelProgress] = useState(0);
  const [modelLoading, setModelLoading] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fleetRef = useRef<HTMLDivElement>(null);
  const constructionRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const bespokeRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const contactRef: React.RefObject<HTMLDivElement | null> = useRef(null);
  const heroRef: React.RefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
  }, []);

  useEffect(() => {
    if (!activeBoat) return;
    setSelectedOptions(Object.fromEntries(activeBoat.configurationGroups.map((group) => [
      group.id,
      defaultOptionIds(group),
    ])));
  }, [activeBoat?.id, activeBoat?.configurationGroups]);

  useEffect(() => {
    if (showBoatDetails) fleetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showBoatDetails]);

  const handleModelProgress = useCallback((progress: number) => {
    setModelProgress(progress);
    setModelLoading(true);
    if (progress >= 100) {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => setModelLoading(false), 650);
    }
  }, []);

  const handleModelLoadError = useCallback(() => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setModelLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBoats(controller.signal)
      .then((loadedBoats) => {
        if (loadedBoats.length === 0) {
          setBoatsError("No published fleet entries are available. Showing the local EB-63 preview.");
          return;
        }
        setBoats(loadedBoats);
        setActiveBoat(loadedBoats[0] ?? null);
        setShowBoatDetails(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setBoatsError("The live fleet is unavailable. Showing the local EB-63 preview.");
      });

    return () => controller.abort();
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  const selectBoat = (boat: BoatModel) => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setModelLoading(false);
    setActiveBoat(boat);
    setShowBoatDetails(false);
  };

  const selectedConfigurationOptions = useMemo(() => activeBoat?.configurationGroups.flatMap((group) => {
    const selectedIds = selectedOptions[group.id] ?? defaultOptionIds(group);
    return group.options.filter((option) => selectedIds.includes(option.id));
  }) ?? [], [activeBoat?.configurationGroups, selectedOptions]);
  const selectedEffects = useMemo(() => selectedConfigurationOptions.flatMap((option) => option.effects), [selectedConfigurationOptions]);

  const toggleConfigurationOption = (groupId: string, optionId: string, selectionMode: "single" | "multiple") => {
    setSelectedOptions((current) => {
      const selected = current[groupId] ?? [];
      const next = selectionMode === "single"
        ? [optionId]
        : selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId];
      return { ...current, [groupId]: next };
    });
  };

  const navigation = (
      <nav className={`site-nav fixed top-0 left-0 right-0 z-50${navScrolled ? " is-scrolled" : ""}`}>
        <div className="site-nav-inner max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* wordmark */}
          <div className="site-wordmark flex items-center gap-3">
            <img src="https://cms.emirateboats.com/assets/b693203a-b37c-47ce-be08-2d9dfc9428ec" alt="Emirates Boats Logo" onClick={() => scrollTo(heroRef)} />
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
              <span key={i} className="block h-px" style={{ width: `${w * 4}px`, background: "#8fc8ed" }} />
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
  );

  if (!activeBoat) return <div className="site-shell">{navigation}<div className="cms-status">Loading the Emirates Boats fleet...</div></div>;

  return (
    <div className="site-shell">
      {navigation}

      {/* ── HERO ────────────────────────────────────────── */}
      <section ref={heroRef} className="hero-section relative flex flex-col justify-end overflow-hidden" style={{ minHeight: "100svh" }}>
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
      <section className="fleet-section configurator-section" id="fleet" ref={fleetRef}>
        {boatsError && <p className="fleet-fallback-notice configurator-notice" role="status">{boatsError}</p>}
        {showBoatDetails ? (
          <div className="configurator-details">
            <div className="configurator-details-models pointer-events-auto">
              {boats.map((boat) => (
                <button key={boat.id} type="button" className={activeBoat.id === boat.id ? "is-active" : ""} onClick={() => selectBoat(boat)}>
                  <span>{boat.name}</span><small>{boat.tagline}</small>
                </button>
              ))}
            </div>
            <BoatDetails boat={activeBoat} onBack={() => setShowBoatDetails(false)} />
          </div>
        ) : (
          <div className="configurator-stage">
            <BoatViewer
              key={activeBoat.id}
              modelUrl={activeBoat.modelUrl}
              materialColors={activeBoat.materialColors}
              zoomFactor={activeBoat.zoomFactor}
              effects={selectedEffects}
              onLoadProgress={handleModelProgress}
              onLoadError={handleModelLoadError}
            />
            {!activeBoat.modelUrl && activeBoat.gallery[0] && <div className="configurator-fallback-image" style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 12, 14, 0.34), rgba(5, 12, 14, 0.56)), linear-gradient(0deg, rgba(5, 12, 14, 0.68), transparent 55%), url("${activeBoat.gallery[0].url}")` }} aria-hidden="true" />}
            {!activeBoat.modelUrl && <div className="model-unavailable" role="status" aria-live="polite">3D preview is currently unavailable for this model.</div>}
            <div className="configurator-overlay pointer-events-none">
              <header className="configurator-topbar pointer-events-auto">
                <div className="configurator-brand-block">
                  <p className="configurator-brand">Emirates <span>Boats</span></p>
                  <p className="configurator-eyebrow">Bespoke configuration · Dubai, UAE</p>
                  <div className="configurator-models" aria-label="Choose a boat model">
                    {boats.map((boat) => (
                      <button key={boat.id} type="button" className={activeBoat.id === boat.id ? "is-active" : ""} aria-pressed={activeBoat.id === boat.id} onClick={() => selectBoat(boat)}>
                        {boat.name}
                      </button>
                    ))}
                  </div>
                </div>
                {activeBoat.configurationGroups.length > 0 && <div className="configurator-summary" aria-live="polite" aria-label="Current customization selections">
                  <p>Your configuration</p>
                  {activeBoat.configurationGroups.map((group) => {
                    const selectedIds = selectedOptions[group.id] ?? defaultOptionIds(group);
                    const chosen = group.options.filter((option) => selectedIds.includes(option.id)).map((option) => option.label);
                    return <div key={group.id}><span>{group.label}</span><strong>{chosen.join(", ") || "Not selected"}</strong></div>;
                  })}
                </div>}
              </header>

              <div className="configurator-identity">
                <p className="configurator-eyebrow">The {activeBoat.name}</p>
                <h2>{activeBoat.tagline || "Built for the open water"}</h2>
                <div className="configurator-quick-specs">
                  <span>{activeBoat.length || "Length on request"}</span>
                  <span>{activeBoat.power || "Power on request"}</span>
                  <span>{activeBoat.speed || "Performance on request"}</span>
                </div>
                <button type="button" className="configurator-details-link pointer-events-auto" onClick={() => setShowBoatDetails(true)}>
                  Explore specifications <span aria-hidden="true">↗</span>
                </button>
              </div>

              <aside className="configurator-panel pointer-events-auto" aria-label="Boat configuration options">
                <div className="configurator-panel-heading">
                  <div><p className="configurator-eyebrow">Build your {activeBoat.name}</p><h3>Configure</h3></div>
                  <span className="configurator-step">{String(activeBoat.configurationGroups.length).padStart(2, "0")} groups</span>
                </div>

                {activeBoat.configurationGroups.length === 0 ? (
                  <p className="configurator-empty" role="status">No configuration options are published for this model.</p>
                ) : activeBoat.configurationGroups.map((group) => {
                  const selectedIds = selectedOptions[group.id] ?? defaultOptionIds(group);
                  const selectedLabels = group.options.filter((option) => selectedIds.includes(option.id)).map((option) => option.label);
                  const swatchGroup = group.options.length > 0 && group.options.every((option) => option.swatchColor);
                  return (
                    <section className="configurator-group" key={group.id} aria-labelledby={`config-group-${group.id}`}>
                      <div className="configurator-group-heading">
                        <h4 id={`config-group-${group.id}`}>{group.label}</h4>
                        <span>{selectedLabels.join(", ")}</span>
                      </div>
                      {swatchGroup ? (
                        <div className="configurator-swatches">
                          {group.options.map((option) => {
                            const isSelected = selectedIds.includes(option.id);
                            return <button key={option.id} type="button" title={option.label} className={isSelected ? "is-selected" : ""} aria-label={option.label} aria-pressed={isSelected} onClick={() => toggleConfigurationOption(group.id, option.id, group.selectionMode)}><span style={{ backgroundColor: option.swatchColor }} /></button>;
                          })}
                        </div>
                      ) : (
                        <div className="configurator-option-list">
                          {group.options.map((option) => {
                            const isSelected = selectedIds.includes(option.id);
                            return <button key={option.id} type="button" className={`configurator-option${isSelected ? " is-selected" : ""}`} aria-pressed={isSelected} onClick={() => toggleConfigurationOption(group.id, option.id, group.selectionMode)}>
                              <span className="configurator-radio" aria-hidden="true" />
                              <span className="configurator-option-copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
                            </button>;
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}

                <div className="configurator-panel-footer">
                  <button type="button" onClick={() => scrollTo(contactRef)}>Enquire about this build <span aria-hidden="true">↗</span></button>
                </div>
              </aside>

              <footer className="configurator-controls" aria-label="3D viewer controls">
                <span><i className="orbit-mark" aria-hidden="true" /> Drag to orbit</span>
                <span>Scroll to zoom</span>
                <span>Click and drag to inspect</span>
              </footer>
            </div>
            <LoadingStatus progress={modelProgress} visible={modelLoading} />
          </div>
        )}
      </section>

      {/* ── CONSTRUCTION ────────────────────────────────── */}
      <section className="construction-section" id="construction" ref={constructionRef}>
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
      <section className="bespoke-section" id="contact" ref={contactRef}>
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
              { h: "Fleet", links: ["EB-46 Center Console", "EB-63 Center Console", "EB Cat 80"], href: ["#fleet", "#fleet", "#fleet"] },
              { h: "Company", links: ["About Us", "Instagram", "Facebook", "LinkedIn"], href: ["#construction", "https://www.instagram.com/emiratesboat", "https://www.facebook.com/emiratesboats", "https://www.linkedin.com/company/emirates-boats-llc"] },
              { h: "Services", links: ["Bespoke Builds", "Refit & Service", "Sea Trials", "Parts & Accessories"], href: ["#contact", "#contact", "#contact", "#contact"] },
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
