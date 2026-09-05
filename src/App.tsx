import { useState, useEffect, useRef } from "react";
import BoatViewer, { type BoatBuildType } from "./components/BoatViewer";

interface BoatModel {
  id: string;
  name: string;
  tagline: string;
  buildType: BoatBuildType;
  hullColor: number;
  accentColor: number;
  length: string;
  beam: string;
  displacement: string;
  range: string;
  power: string;
  speed: string;
  capacity: string;
  construction: string;
  description: string;
}

const BOATS: BoatModel[] = [
  {
    id: "eb-46",
    name: "EB-46",
    tagline: "46 ft · Center Console",
    buildType: "centerConsole46",
    hullColor: 0xfafafa,
    accentColor: 0xc4973a,
    length: "46 ft / 14.0 m",
    beam: "10.5 ft / 3.2 m",
    displacement: "9,200 lbs",
    range: "280 nm",
    power: "3 × Mercury V10 450R (450 hp ea.)",
    speed: "62 kn max / 38 kn cruise",
    capacity: "10 persons",
    construction: "E-glass / vinylester deep-V",
    description:
      "The EB-46 is our entry into serious offshore sport fishing. A sharp deep-V runs the full length of the hull, cutting through Gulf chop without sacrificing top speed. Triple 450R outboards deliver 1,350 combined horses. Forward fish box, two 70-gallon livewells, 12 flush rod holders, and an integrated T-top with full electronics arch come standard.",
  },
  {
    id: "eb-63",
    name: "EB-63",
    tagline: "63 ft · Center Console",
    buildType: "centerConsole63",
    hullColor: 0x1c2e3e,
    accentColor: 0xc4973a,
    length: "63 ft / 19.2 m",
    beam: "13.8 ft / 4.2 m",
    displacement: "24,600 lbs",
    range: "420 nm",
    power: "4 × Mercury Verado 600 (600 hp ea.)",
    speed: "58 kn max / 36 kn cruise",
    capacity: "16 persons",
    construction: "Carbon-reinforced E-glass / infused hull",
    description:
      "The EB-63 is one of the largest center-console sport fishing platforms in the Gulf. Four Mercury Verado 600s push it to 58 knots on a stepped, vacuum-infused hull that saves 680 kg over a comparable wet-laminate build. Below-deck overnight berths for four, a full-head, a refrigerated fish hold, and outriggers rated for 130 kg blue marlin.",
  },
  {
    id: "eb-cat-80",
    name: "EB Cat 80",
    tagline: "80 ft · Carbon Fiber Catamaran",
    buildType: "catamaran80",
    hullColor: 0x0d1215,
    accentColor: 0xc4973a,
    length: "80 ft / 24.4 m",
    beam: "34 ft / 10.4 m",
    displacement: "38,000 lbs",
    range: "1,200 nm",
    power: "2 × Volvo IPS 800 (600 hp ea.)",
    speed: "28 kn max / 22 kn cruise",
    capacity: "24 day / 10 overnight",
    construction: "Full pre-preg carbon fiber / vacuum-bagged",
    description:
      "Built entirely from pre-preg carbon fiber in a temperature-controlled autoclave, the EB Cat 80 weighs 40% less than a comparable GRP platform. The wide 10.4 m bridge deck eliminates slamming and provides a stable, hotel-quality interior spanning three cabins, a master suite, and a full galley. The flybridge carries a 3.5 m tender on integrated davits alongside a full wet bar and sun loungers for 10.",
  },
];

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
  const [activeBoat, setActiveBoat] = useState<BoatModel>(BOATS[0]);
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

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    ref.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: "#07121e", color: "#cfd9e6", fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh" }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: navScrolled ? "rgba(7,18,30,0.96)" : "transparent",
          borderBottom: navScrolled ? "1px solid rgba(196,151,58,0.2)" : "none",
          backdropFilter: navScrolled ? "blur(14px)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* wordmark */}
          <div className="flex items-center gap-3">
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
              <path d="M2 18 Q9 4 16 10 Q23 4 30 18" stroke="#c4973a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <line x1="2" y1="20" x2="30" y2="20" stroke="#c4973a" strokeWidth="1.5"/>
              <line x1="16" y1="10" x2="16" y2="2" stroke="#c4973a" strokeWidth="1.5"/>
            </svg>
            <div>
              <span
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontWeight: 500,
                  fontSize: "1.0rem",
                  color: "#e8eef5",
                  letterSpacing: "0.05em",
                }}
              >
                Emirates Boats
              </span>
              <span
                style={{
                  display: "block",
                  fontFamily: "DM Mono, monospace",
                  fontSize: "0.52rem",
                  color: "#c4973a",
                  letterSpacing: "0.22em",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                LLC · Dubai
              </span>
            </div>
          </div>

          {/* desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {["Our Fleet", "Construction", "Bespoke", "Contact"].map((l) => (
              <button
                key={l}
                onClick={() => {
                  if (l === "Our Fleet") scrollTo(fleetRef);
                  if (l === "Construction") scrollTo(constructionRef);
                  if (l === "Bespoke") scrollTo(bespokeRef);
                  if (l === "Contact") scrollTo(contactRef);
                }}
                style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem", color: "#6a8098", letterSpacing: "0.14em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#c4973a")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#6a8098")}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            className="hidden md:block px-5 py-2 transition-all duration-200"
            style={{ border: "1px solid #c4973a", color: "#c4973a", fontFamily: "DM Mono, monospace", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", background: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#c4973a"; (e.currentTarget as HTMLElement).style.color = "#07121e"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#c4973a"; }}
          >
            Enquire
          </button>

          <button className="md:hidden flex flex-col gap-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {[5, 5, 3].map((w, i) => (
              <span key={i} className="block h-px" style={{ width: `${w * 4}px`, background: "#c4973a" }} />
            ))}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-4 px-6 pb-6" style={{ background: "rgba(7,18,30,0.98)" }}>
            {["Our Fleet", "Construction", "Bespoke", "Contact"].map((l) => (
              <button key={l} className="text-left" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem", color: "#6a8098", letterSpacing: "0.14em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}
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
      <section className="relative flex flex-col justify-end overflow-hidden" style={{ minHeight: "100svh" }}>
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1545647274-96644da34363?w=1800&h=1100&fit=crop&auto=format)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,18,30,0.25) 0%, rgba(7,18,30,0.1) 30%, rgba(7,18,30,0.7) 68%, rgba(7,18,30,1.0) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(7,18,30,0.55) 0%, transparent 55%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 pt-28 w-full">
          <div className="max-w-lg">
            <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem", color: "#c4973a", letterSpacing: "0.26em", textTransform: "uppercase", marginBottom: "20px" }}>
              Dubai · United Arab Emirates
            </p>
            <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(2.8rem, 6.5vw, 5rem)", fontWeight: 400, color: "#e8eef5", lineHeight: 1.02, marginBottom: "22px" }}>
              Purpose-built
              <br />
              <em style={{ fontStyle: "italic", color: "#c4973a" }}>for the Gulf.</em>
            </h1>
            <p style={{ color: "#7a94ae", fontSize: "1rem", lineHeight: 1.72, maxWidth: "40ch", marginBottom: "36px" }}>
              Emirates Boats LLC designs and builds high-performance center-console sport fishers and offshore catamarans — engineered for Gulf conditions, finished to international standards.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo(fleetRef)}
                style={{ background: "#c4973a", color: "#07121e", fontFamily: "DM Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "14px 28px", border: "none", cursor: "pointer", fontWeight: 500, transition: "background 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#d4aa5a")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#c4973a")}
              >
                View the Fleet
              </button>
              <button
                style={{ background: "transparent", color: "#cfd9e6", fontFamily: "DM Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "14px 28px", border: "1px solid rgba(207,217,230,0.28)", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,151,58,0.6)"; (e.currentTarget as HTMLElement).style.color = "#c4973a"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(207,217,230,0.28)"; (e.currentTarget as HTMLElement).style.color = "#cfd9e6"; }}
              >
                Our Process
              </button>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="relative z-10 w-full" style={{ borderTop: "1px solid rgba(196,151,58,0.2)", background: "rgba(7,18,30,0.85)", backdropFilter: "blur(10px)" }}>
          <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              ["3", "Models Available"],
              ["46–80 ft", "Range"],
              ["Full Carbon", "Cat Construction"],
              ["Dubai", "Build Facility"],
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.4rem", color: "#c4973a", lineHeight: 1, marginBottom: "3px" }}>{val}</p>
                <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.58rem", color: "#4a6070", letterSpacing: "0.14em", textTransform: "uppercase" }}>{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET / 3D VIEWER ───────────────────────────── */}
      <section ref={fleetRef} style={{ background: "#07121e", padding: "80px 0 96px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", color: "#c4973a", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "12px" }}>
                Current Lineup
              </p>
              <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "#e8eef5", lineHeight: 1.1 }}>
                Three models.
                <br />
                <em style={{ fontStyle: "italic", color: "#c4973a" }}>No compromises.</em>
              </h2>
            </div>
            <p style={{ color: "#6a8098", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "38ch" }}>
              Drag to orbit · scroll to zoom · each vessel is available for sea trial in Dubai Marina.
            </p>
          </div>

          <div style={{ border: "1px solid rgba(196,151,58,0.2)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
              {/* selector */}
              <div style={{ borderRight: "1px solid rgba(196,151,58,0.15)" }}>
                {BOATS.map((boat, i) => (
                  <button
                    key={boat.id}
                    onClick={() => setActiveBoat(boat)}
                    className="w-full text-left relative transition-colors duration-150"
                    style={{
                      padding: "22px 24px",
                      background: activeBoat.id === boat.id ? "rgba(196,151,58,0.07)" : "transparent",
                      borderBottom: i < BOATS.length - 1 ? "1px solid rgba(196,151,58,0.12)" : "none",
                      cursor: "pointer",
                      border: "none",
                      display: "block",
                    }}
                    onMouseEnter={(e) => { if (activeBoat.id !== boat.id) (e.currentTarget as HTMLElement).style.background = "rgba(196,151,58,0.03)"; }}
                    onMouseLeave={(e) => { if (activeBoat.id !== boat.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {activeBoat.id === boat.id && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: "#c4973a" }} />
                    )}
                    <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1.1rem", color: activeBoat.id === boat.id ? "#e8cc8a" : "#b8c8d8", marginBottom: "5px", fontWeight: 400 }}>
                      {boat.name}
                    </p>
                    <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", color: "#3a5060", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {boat.tagline}
                    </p>
                  </button>
                ))}
              </div>

              {/* 3D pane */}
              <div className="flex flex-col">
                {/* canvas */}
                <div style={{ background: "#040d17", position: "relative", minHeight: "420px", flex: "1 1 auto" }}>
                  <BoatViewer
                    key={activeBoat.id}
                    buildType={activeBoat.buildType}
                    hullColor={activeBoat.hullColor}
                    accentColor={activeBoat.accentColor}
                  />
                  <div style={{ position: "absolute", top: "16px", left: "16px", fontFamily: "DM Mono, monospace", fontSize: "0.58rem", color: "#c4973a", letterSpacing: "0.14em", background: "rgba(4,13,23,0.75)", padding: "6px 10px", border: "1px solid rgba(196,151,58,0.2)" }}>
                    {activeBoat.name} — INTERACTIVE 3D MODEL
                  </div>
                  <div style={{ position: "absolute", bottom: "14px", right: "14px", fontFamily: "DM Mono, monospace", fontSize: "0.55rem", color: "#3a5060", letterSpacing: "0.1em", background: "rgba(4,13,23,0.7)", padding: "5px 10px" }}>
                    DRAG · ZOOM · ORBIT
                  </div>
                </div>

                {/* specs */}
                <div style={{ borderTop: "1px solid rgba(196,151,58,0.15)", background: "#0a1825", padding: "28px 32px" }}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5 mb-6">
                    {SPEC_KEYS.map((k) => (
                      <div key={k}>
                        <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.54rem", color: "#3a5060", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "4px" }}>
                          {SPEC_LABELS[k]}
                        </p>
                        <p style={{ color: "#b8c8d8", fontSize: "0.8rem", lineHeight: 1.4 }}>
                          {activeBoat[k] as string}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: "#5a7080", fontSize: "0.83rem", lineHeight: 1.7, maxWidth: "72ch" }}>
                    {activeBoat.description}
                  </p>
                  <button
                    style={{ marginTop: "20px", border: "1px solid rgba(196,151,58,0.4)", color: "#c4973a", background: "transparent", fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "10px 22px", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#c4973a"; (e.currentTarget as HTMLElement).style.color = "#07121e"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#c4973a"; }}
                  >
                    Request Specification Sheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSTRUCTION ────────────────────────────────── */}
      <section  style={{ background: "#040d17", padding: "88px 0" }} ref={constructionRef}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div style={{ position: "relative", aspectRatio: "16/10", background: "#07121e", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1625183656263-171183307b15?w=900&h=600&fit=crop&auto=format"
                alt="High-speed center console boat underway"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.8) saturate(0.95)" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(4,13,23,0.5) 0%, transparent 65%)" }} />
            </div>
            <div>
              <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", color: "#c4973a", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "16px" }}>
                How We Build
              </p>
              <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 400, color: "#e8eef5", lineHeight: 1.12, marginBottom: "20px" }}>
                Engineered for
                <br />
                <em style={{ fontStyle: "italic", color: "#c4973a" }}>Gulf conditions</em>
              </h2>
              <p style={{ color: "#5a7080", lineHeight: 1.78, marginBottom: "16px", fontSize: "0.9rem" }}>
                Every hull we build starts with a finite-element structural analysis for our specific sea state. The Gulf of Oman presents short, steep chop at 2–3 m that punishes inadequately reinforced transoms. Our center consoles use a 28° deep-V with longitudinal stringers bonded in carbon-loaded epoxy.
              </p>
              <p style={{ color: "#5a7080", lineHeight: 1.78, fontSize: "0.9rem" }}>
                The EB Cat 80 is built entirely from pre-preg carbon fiber — laid by hand in our Dubai facility, cured under vacuum at 80°C, and inspected ultrasonically before the hulls are joined.
              </p>
            </div>
          </div>

          {/* process */}
          <div style={{ borderTop: "1px solid rgba(196,151,58,0.14)", paddingTop: "60px" }}>
            <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", color: "#c4973a", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "36px", textAlign: "center" }}>
              Build Stages
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { n: "01", t: "Hull Analysis", b: "FEA and CFD model run for Gulf sea states before a single layer of glass or carbon is cut." },
                { n: "02", t: "Lamination", b: "Pre-preg carbon (Cat 80) or infused vinylester (center consoles) laid in climate-controlled bays." },
                { n: "03", t: "Systems Fit-Out", b: "Electronics, rigging, fuel, and propulsion installed and independently certified before launch." },
                { n: "04", t: "Sea Trial", b: "Full-speed runs to rated maximum, instrument calibration, and customer handover in Dubai Marina." },
              ].map(({ n, t, b }) => (
                <div key={n} style={{ paddingLeft: "20px", borderLeft: "1px solid rgba(196,151,58,0.22)" }}>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", color: "#c4973a", letterSpacing: "0.12em", display: "block", marginBottom: "10px" }}>{n}</span>
                  <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "1rem", color: "#b8c8d8", marginBottom: "9px" }}>{t}</p>
                  <p style={{ color: "#3a5060", fontSize: "0.82rem", lineHeight: 1.68 }}>{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────── */}
      <section  style={{ background: "#07121e", padding: "0 0 80px" }} ref={bespokeRef}> 
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-1.5" style={{ height: "240px" }}>
            {[
              { url: "https://images.unsplash.com/photo-1552160757-52790c6f4faf?w=700&h=500&fit=crop&auto=format", alt: "Sport boat at speed" },
              { url: "https://images.unsplash.com/photo-1621459287809-d7b86ccf69f8?w=700&h=500&fit=crop&auto=format", alt: "Catamaran under sail" },
              { url: "https://images.unsplash.com/photo-1686048075764-996b3c825d7b?w=700&h=500&fit=crop&auto=format", alt: "Dubai marina" },
            ].map(({ url, alt }) => (
              <div key={url} style={{ overflow: "hidden", background: "#040d17", position: "relative" }}>
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.72) saturate(0.85)", transition: "transform 0.6s ease" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section style={{ background: "#040d17", borderTop: "1px solid rgba(196,151,58,0.15)", borderBottom: "1px solid rgba(196,151,58,0.15)", padding: "88px 24px" }} ref={contactRef}>
        <div className="max-w-xl mx-auto text-center">
          <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", color: "#c4973a", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "20px" }}>
            Bespoke Programme
          </p>
          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "#e8eef5", lineHeight: 1.1, marginBottom: "20px" }}>
            Have a specific
            <br />
            <em style={{ fontStyle: "italic", color: "#c4973a" }}>brief in mind?</em>
          </h2>
          <p style={{ color: "#5a7080", lineHeight: 1.78, maxWidth: "44ch", margin: "0 auto 36px", fontSize: "0.9rem" }}>
            We take on bespoke commissions alongside our standard models. From an extended-range 55 ft center console to a custom 100 ft carbon cat — bring the spec, we'll build it.
          </p>
          <button
            style={{ background: "#c4973a", color: "#07121e", fontFamily: "DM Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", padding: "15px 34px", border: "none", cursor: "pointer", fontWeight: 500, transition: "background 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#d4aa5a")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#c4973a")}
          >
            Contact the Build Team
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{ background: "#030a12", padding: "52px 24px 28px" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: "0.95rem", color: "#b8c8d8", marginBottom: "6px", letterSpacing: "0.05em" }}>Emirates Boats LLC</p>
              <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.56rem", color: "#c4973a", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>Dubai, UAE</p>
              <p style={{ color: "#283848", fontSize: "0.8rem", lineHeight: 1.7 }}>
                Dubai Marina,<br />
                Sheikh Zayed Road,<br />
                Dubai, UAE
              </p>
            </div>
            {[
              { h: "Fleet", links: ["EB-46 Center Console", "EB-63 Center Console", "EB Cat 80"] },
              { h: "Company", links: ["About Us", "The Facility", "Careers", "News"] },
              { h: "Services", links: ["Bespoke Builds", "Refit & Service", "Sea Trials", "Parts & Accessories"] },
            ].map(({ h, links }) => (
              <div key={h}>
                <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.58rem", color: "#c4973a", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "14px" }}>{h}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "9px" }}>
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" style={{ color: "#283848", fontSize: "0.8rem", textDecoration: "none", transition: "color 0.15s" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#7a94ae")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#283848")}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(40,56,72,0.5)", paddingTop: "20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.55rem", color: "#1e2e3e", letterSpacing: "0.1em" }}>© 2024 Emirates Boats LLC. All rights reserved.</p>
            <p style={{ fontFamily: "DM Mono, monospace", fontSize: "0.55rem", color: "#1e2e3e", letterSpacing: "0.1em" }}>PRIVACY · TERMS · COOKIES</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
