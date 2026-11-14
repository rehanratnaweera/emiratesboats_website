/** Copy for the three in-depth service pages. Source: Emirates Boats service portfolios. */

const images = import.meta.glob<string>("../assets/services/*.webp", { eager: true, import: "default" });

function asset(name: string) {
  const url = images[`../assets/services/${name}.webp`];
  if (!url) throw new Error(`Missing service image: ${name}`);
  return url;
}

/* ── Painting ─────────────────────────────────────────────────────────── */

export interface PaintFinish {
  id: string;
  name: string;
  ref: string;
  hex: string;
  note: string;
  golden: string;
  daylight: string;
}

const finish = (id: string, name: string, ref: string, hex: string, note: string): PaintFinish => ({
  id,
  name,
  ref,
  hex,
  note,
  golden: asset(`finish-${id}-golden`),
  daylight: asset(`finish-${id}-day`),
});

export const PAINTING = {
  kicker: "Marine custom painting & refinishing",
  title: "We can paint your boat as you like.",
  lede: "240 bespoke Cromax® colors. Any RAL, Pantone or corporate match. Applied by our master craftspeople in Dubai.",
  columns: [
    {
      heading: "Master marine painting",
      copy: "At Emirates Boats LLC, we extend our world-class boat building expertise to specialized marine painting and refinishing services. From full hull color changes to custom multi-tone graphics, our master craftspeople deliver flawless factory-quality finishes tailored to your exact preferences.",
    },
    {
      heading: "Premium Cromax® systems",
      copy: "We exclusively utilize high-performance Cromax® paint systems by Axalta. Engineered for demanding marine environments, Cromax® coatings offer unparalleled gloss retention, extreme UV resistance, color durability, and superior defense against harsh saltwater exposure.",
    },
  ],
  freedom: {
    heading: "Total customization freedom",
    copy: "Beyond our 240 standard colors, we match any corporate identity, metallic flake, pearl effect or bespoke color formula requested by the owner.",
  },
  galleryNote: "The same hull, painted your way. Every render shows a Cromax® finish from the swatch library, in golden-hour light and in daylight.",
  finishes: [
    finish("gunmetal-grey", "Gunmetal Grey", "CRM-GM46", "#4a5361", "Sleek industrial metallic hull with a high-contrast black superstructure."),
    finish("arctic-white", "Arctic White", "CRM-AW01", "#f8fafc", "Pristine high-gloss mirror white reflecting classic marine elegance."),
    finish("ruby-red", "Ruby Red", "CRM-RR40", "#a81e22", "Striking high-impact red hull accentuating high-performance agility."),
    finish("electric-blue", "Electric Blue", "CRM-EB20", "#1f4bc0", "Vibrant ocean-inspired blue engineered for maximum coastal presence."),
    finish("jet-black", "Jet Black", "CRM-JB05", "#0f172a", "Deep obsidian gloss coating with a stealthy, luxurious aesthetic."),
    finish("burnt-orange", "Burnt Orange", "CRM-BO41", "#cc5a12", "Distinctive warm metallic finish designed to stand out in any marina."),
    finish("sunburst-gold", "Sunburst Gold", "CRM-SG49", "#f2a413", "Radiant golden finish with a sunlit, high-visibility presence."),
  ],
  libraryNote: "12 color families, 20 colors each, every color with its own name and reference. Quote the reference when you order.",
  disclaimer: "Colors shown are digital approximations and may vary by screen. References are Emirates Boats LLC swatch codes; the final shade is confirmed against a physical Cromax® sample before application.",
  features: [
    { title: "Full hull & topside refinishing", copy: "Multi-stage sanding, epoxy barrier priming, Cromax® basecoat & UV clearcoat." },
    { title: "Engine cowling customization", copy: "Color matching for up to 5 outboard motors (Mercury 500R / 450R) with custom graphics." },
    { title: "5-year gloss & adhesion guarantee", copy: "Warranty & protection on every Emirates Boats paint application." },
    { title: "Saltwater & thermal protection", copy: "UV-resistant Cromax® coatings built for harsh saltwater and Gulf heat." },
  ],
};

/* ── Tooling ──────────────────────────────────────────────────────────── */

const step = (index: number, title: string, copy: string, alt: string) => ({
  number: String(index).padStart(2, "0"),
  title,
  copy,
  alt,
  image: asset(`tooling-step-${String(index).padStart(2, "0")}`),
});

export const TOOLING = {
  kicker: "Tooling Center · 5-axis CNC service",
  title: "From digital file to finished mold.",
  lede: "Design, fabrication, carpentry, 5-axis milling, finishing and molding — all under one roof in Jebel Ali.",
  hero: asset("tooling-step-07"),
  heroAlt: "5-axis milling head machining a hull plug",
  machine: {
    kicker: "Our machine · Belotti 5-axis CNC",
    envelope: "24 × 7.5 × 4.2 m",
    note: "X · Y · Z axis travel for hull-scale plugs and molds",
    axes: [
      { value: "24,000", label: "X mm" },
      { value: "7,500", label: "Y mm" },
      { value: "4,200", label: "Z mm" },
      { value: "540°", label: "C axis" },
      { value: "±120°", label: "A axis" },
    ],
  },
  columns: [
    {
      heading: "Plug and mold, start to finish",
      copy: "From your CAD files to a finished, high-gloss plug and production mold — designed, fabricated, milled, finished and molded by one team at the Emirates Boats Tooling Center in Jebel Ali.",
    },
    {
      heading: "See the shape before you commit",
      copy: "After the 5-axis pre-machining stage you see the real shape of your product and approve it before lamination begins. Our technical office prepares all drawings and an accurate bill of materials to reduce cost and execution time.",
    },
  ],
  capabilities: [
    { title: "Design", copy: "Technical drawings & BOQ from your files" },
    { title: "Fabrication", copy: "Steel cradles with anti-corrosion treatment" },
    { title: "Carpentry", copy: "Wood base and polystyrene mass assembly" },
    { title: "Milling", copy: "5-axis roughing and finishing" },
    { title: "Finishing", copy: "Sanding, primer, fairing and high gloss" },
    { title: "Molding", copy: "Gelcoat, lamination and mold frames" },
  ],
  processNote: "Every stage is carried out in our own workshop. These are real photos from our tooling projects.",
  steps: [
    step(1, "Design & cradle engineering", "Our technical office studies your files and prepares all technical drawings and an accurate BOQ.", "CAD model of a hull plug on screen in the technical office"),
    step(2, "Steel cradle & wood base", "Steel cradle built to the design and protected against corrosion, with a wood base secured on top.", "Timber base being fitted to a steel cradle"),
    step(3, "Polystyrene mass assembly", "Our carpenters assemble the polystyrene mass to create the volumetric shape of the plug.", "Polystyrene blocks assembled along the workshop floor"),
    step(4, "5-axis roughing & finishing", "The cradle enters the 5-axis machine for roughing and finishing of the polystyrene mass.", "Milling cutter roughing the polystyrene mass"),
    step(5, "Lamination of the blocks", "Once you approve the shape, the mass is laminated with dedicated tooling materials.", "Technicians laminating the milled shape"),
    step(6, "Milling paste extrusion", "A milling paste compound is extruded over the laminated plug.", "Milling paste being extruded over the plug"),
    step(7, "Paste machining", "When the compound has cured, the 5-axis machine starts its pre-machining and finishing.", "5-axis head machining the cured paste"),
    step(8, "Surface finishing", "The surface is finished to the quality level requested by the client.", "Technician sanding the plug surface"),
    step(9, "Primer & fairing", "Light sanding, then a prime-coat filler is applied and faired until the surface is smooth.", "Plug in grey primer after fairing"),
    step(10, "High-gloss plug", "The plug receives its high-gloss coating, ready to produce the mold.", "Finished plug with a mirror-gloss surface"),
    step(11, "Gelcoat & mold lamination", "The mold is gelcoated and laminated layer by layer from the finished plug.", "Mold being laminated over the plug"),
    step(12, "Mold frame & lifting", "The mold frame is fabricated and laminated, and the finished tool is lifted by crane.", "Finished mold lifted by crane"),
  ],
  molds: {
    heading: "Plugs & molds from our workshop",
    copy: "Finished tooling for composite hulls and decks, produced at the Emirates Boats Tooling Center.",
    images: [
      { src: asset("tooling-mold-1"), alt: "High-gloss black deck plug" },
      { src: asset("tooling-mold-2"), alt: "Green production mold for a deck component" },
      { src: asset("tooling-mold-3"), alt: "Hull plug with a polished dark finish" },
      { src: asset("tooling-mold-4"), alt: "Green hull mold seen from the bow" },
    ],
  },
};

/* ── Hydraulic swim platforms ─────────────────────────────────────────── */

export const HYDRAULICS = {
  kicker: "Swim platforms · Hydraulics",
  title: "Hydraulic swim platforms with digital monitoring.",
  lede: "Supply and installation. H+B technics, Besenzoni and Opacmare.",
  hero: asset("hydraulics-main"),
  heroAlt: "Dark hydraulic swim platform wrapped around four Mercury V12 600 outboards",
  intro: {
    kicker: "From the water to the deck",
    heading: "The platform that does the work.",
    copy: "We fit electro-hydraulic swim platforms from the leading European makers, specified to your boat and installed at our Jebel Ali yard, with digital monitoring.",
  },
  stats: [
    { value: "3", label: "Partner brands" },
    { value: "Electro-hydraulic", label: "Raise and lower" },
    { value: "Teak", label: "Surface, stainless frame" },
    { value: "Safety locks", label: "And stanchions" },
  ],
  fitted: {
    heading: "Fitted on the EB 63 Extended Cabin",
    copy: "Photographed on our own boat.",
    photos: [
      { src: asset("hydraulics-transom"), title: "At the transom", copy: "A dark, flush platform wraps around four Mercury V12 600 outboards." },
      { src: asset("hydraulics-cockpit"), title: "Flush with the cockpit", copy: "The Sea Deck cockpit floor runs aft to the platform edge." },
      { src: asset("hydraulics-dock"), title: "At the dock", copy: "The EB 63 Extended Cabin on the dock, platform and engines astern." },
      { src: asset("hydraulics-name"), title: "Our name on it", copy: "The platform surface carries the Emirates Boats name." },
    ],
  },
  benefits: {
    heading: "One piece of equipment, several jobs.",
    items: [
      { title: "Swim and board", copy: "Lowers to the water for swimming and boarding, and raises to become deck space when you cruise." },
      { title: "Lift tenders and jet skis", copy: "Besenzoni and Opacmare platforms also work as lifts for tenders and jet skis." },
      { title: "Reach the quay", copy: "A tipping end section on the Besenzoni LP 100 Plus extends the last step to the quay." },
      { title: "Safe in use", copy: "Automatic or hydraulic safety locking, removable stanchions, teak surface on a stainless frame." },
      { title: "Digital monitoring", copy: "Specified with digital monitoring, so the platform's status can be watched from the boat's control system." },
      { title: "Made for your boat", copy: "H+B technics, Besenzoni and Opacmare all build to the size and layout of the vessel." },
    ],
  },
  brands: {
    heading: "Our partner brands",
    copy: "Details as published by each maker. We help you choose the model that fits your boat.",
    items: [
      { name: "H+B technics", detail: "Münster, Germany", copy: "Lifting systems for yachts since 1995, mostly hydraulic and custom-engineered. The ASCENDER is a remote-controlled lifting swim platform in 316L stainless steel, with integrated steps, twin-cylinder positioning and safety locking." },
      { name: "Besenzoni", detail: "LP 100 Plus", copy: "Hydraulic raise and lower, with a tipping end section for the quay. Stainless structure, teak surface, double row of removable stanchions. 1,943 mm long, 150–600 kg capacity, built to suit the boat." },
      { name: "Opacmare", detail: "3383 Series", copy: "Transom-mounted, hydraulically powered. Works as a passerelle, swim ladder, tender lift and loading platform, and triples the stern platform when fully open. Twelve versions with 4, 5 or 6 steps." },
    ],
  },
  process: ["Structural check of the vessel", "Choose brand and model", "Install at our yard", "Test and commission"],
};

export const SIGNATURE_IMAGES = {
  painting: asset("finish-gunmetal-grey-golden"),
  tooling: asset("tooling-step-07"),
  hydraulics: asset("hydraulics-main"),
};
