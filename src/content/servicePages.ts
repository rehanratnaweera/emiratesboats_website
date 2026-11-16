/** Copy for the three in-depth service pages. Source: Emirates Boats service portfolios. */

import { msg } from "../i18n";

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
  kicker: msg("Marine custom painting & refinishing"),
  title: msg("We can paint your boat as you like."),
  lede: msg("240 bespoke Cromax® colors. Any RAL, Pantone or corporate match. Applied by our master craftspeople in Dubai."),
  columns: [
    {
      heading: msg("Master marine painting"),
      copy: msg("At Emirates Boats LLC, we extend our world-class boat building expertise to specialized marine painting and refinishing services. From full hull color changes to custom multi-tone graphics, our master craftspeople deliver flawless factory-quality finishes tailored to your exact preferences."),
    },
    {
      heading: msg("Premium Cromax® systems"),
      copy: msg("We exclusively utilize high-performance Cromax® paint systems by Axalta. Engineered for demanding marine environments, Cromax® coatings offer unparalleled gloss retention, extreme UV resistance, color durability, and superior defense against harsh saltwater exposure."),
    },
  ],
  freedom: {
    heading: msg("Total customization freedom"),
    copy: msg("Beyond our 240 standard colors, we match any corporate identity, metallic flake, pearl effect or bespoke color formula requested by the owner."),
  },
  galleryNote: msg("The same hull, painted your way. Every render shows a Cromax® finish from the swatch library, in golden-hour light and in daylight."),
  finishes: [
    finish("gunmetal-grey", "Gunmetal Grey", "CRM-GM46", "#4a5361", msg("Sleek industrial metallic hull with a high-contrast black superstructure.")),
    finish("arctic-white", "Arctic White", "CRM-AW01", "#f8fafc", msg("Pristine high-gloss mirror white reflecting classic marine elegance.")),
    finish("ruby-red", "Ruby Red", "CRM-RR40", "#a81e22", msg("Striking high-impact red hull accentuating high-performance agility.")),
    finish("electric-blue", "Electric Blue", "CRM-EB20", "#1f4bc0", msg("Vibrant ocean-inspired blue engineered for maximum coastal presence.")),
    finish("jet-black", "Jet Black", "CRM-JB05", "#0f172a", msg("Deep obsidian gloss coating with a stealthy, luxurious aesthetic.")),
    finish("burnt-orange", "Burnt Orange", "CRM-BO41", "#cc5a12", msg("Distinctive warm metallic finish designed to stand out in any marina.")),
    finish("sunburst-gold", "Sunburst Gold", "CRM-SG49", "#f2a413", msg("Radiant golden finish with a sunlit, high-visibility presence.")),
  ],
  libraryNote: msg("12 color families, 20 colors each, every color with its own name and reference. Quote the reference when you order."),
  disclaimer: msg("Colors shown are digital approximations and may vary by screen. References are Emirates Boats LLC swatch codes; the final shade is confirmed against a physical Cromax® sample before application."),
  features: [
    { title: msg("Full hull & topside refinishing"), copy: msg("Multi-stage sanding, epoxy barrier priming, Cromax® basecoat & UV clearcoat.") },
    { title: msg("Engine cowling customization"), copy: msg("Color matching for up to 5 outboard motors (Mercury 500R / 450R) with custom graphics.") },
    { title: msg("5-year gloss & adhesion guarantee"), copy: msg("Warranty & protection on every Emirates Boats paint application.") },
    { title: msg("Saltwater & thermal protection"), copy: msg("UV-resistant Cromax® coatings built for harsh saltwater and Gulf heat.") },
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
  kicker: msg("Tooling Center · 5-axis CNC service"),
  title: msg("From digital file to finished mold."),
  lede: msg("Design, fabrication, carpentry, 5-axis milling, finishing and molding — all under one roof in Jebel Ali."),
  hero: asset("tooling-step-07"),
  heroAlt: msg("5-axis milling head machining a hull plug"),
  machine: {
    kicker: msg("Our machine · Belotti 5-axis CNC"),
    envelope: "24 × 7.5 × 4.2 m",
    note: msg("X · Y · Z axis travel for hull-scale plugs and molds"),
    axes: [
      { value: "24,000", label: msg("X mm") },
      { value: "7,500", label: msg("Y mm") },
      { value: "4,200", label: msg("Z mm") },
      { value: "540°", label: msg("C axis") },
      { value: "±120°", label: msg("A axis") },
    ],
  },
  columns: [
    {
      heading: msg("Plug and mold, start to finish"),
      copy: msg("From your CAD files to a finished, high-gloss plug and production mold — designed, fabricated, milled, finished and molded by one team at the Emirates Boats Tooling Center in Jebel Ali."),
    },
    {
      heading: msg("See the shape before you commit"),
      copy: msg("After the 5-axis pre-machining stage you see the real shape of your product and approve it before lamination begins. Our technical office prepares all drawings and an accurate bill of materials to reduce cost and execution time."),
    },
  ],
  capabilities: [
    { title: msg("Design"), copy: msg("Technical drawings & BOQ from your files") },
    { title: msg("Fabrication"), copy: msg("Steel cradles with anti-corrosion treatment") },
    { title: msg("Carpentry"), copy: msg("Wood base and polystyrene mass assembly") },
    { title: msg("Milling"), copy: msg("5-axis roughing and finishing") },
    { title: msg("Finishing"), copy: msg("Sanding, primer, fairing and high gloss") },
    { title: msg("Molding"), copy: msg("Gelcoat, lamination and mold frames") },
  ],
  processNote: msg("Every stage is carried out in our own workshop. These are real photos from our tooling projects."),
  steps: [
    step(1, msg("Design & cradle engineering"), msg("Our technical office studies your files and prepares all technical drawings and an accurate BOQ."), msg("CAD model of a hull plug on screen in the technical office")),
    step(2, msg("Steel cradle & wood base"), msg("Steel cradle built to the design and protected against corrosion, with a wood base secured on top."), msg("Timber base being fitted to a steel cradle")),
    step(3, msg("Polystyrene mass assembly"), msg("Our carpenters assemble the polystyrene mass to create the volumetric shape of the plug."), msg("Polystyrene blocks assembled along the workshop floor")),
    step(4, msg("5-axis roughing & finishing"), msg("The cradle enters the 5-axis machine for roughing and finishing of the polystyrene mass."), msg("Milling cutter roughing the polystyrene mass")),
    step(5, msg("Lamination of the blocks"), msg("Once you approve the shape, the mass is laminated with dedicated tooling materials."), msg("Technicians laminating the milled shape")),
    step(6, msg("Milling paste extrusion"), msg("A milling paste compound is extruded over the laminated plug."), msg("Milling paste being extruded over the plug")),
    step(7, msg("Paste machining"), msg("When the compound has cured, the 5-axis machine starts its pre-machining and finishing."), msg("5-axis head machining the cured paste")),
    step(8, msg("Surface finishing"), msg("The surface is finished to the quality level requested by the client."), msg("Technician sanding the plug surface")),
    step(9, msg("Primer & fairing"), msg("Light sanding, then a prime-coat filler is applied and faired until the surface is smooth."), msg("Plug in grey primer after fairing")),
    step(10, msg("High-gloss plug"), msg("The plug receives its high-gloss coating, ready to produce the mold."), msg("Finished plug with a mirror-gloss surface")),
    step(11, msg("Gelcoat & mold lamination"), msg("The mold is gelcoated and laminated layer by layer from the finished plug."), msg("Mold being laminated over the plug")),
    step(12, msg("Mold frame & lifting"), msg("The mold frame is fabricated and laminated, and the finished tool is lifted by crane."), msg("Finished mold lifted by crane")),
  ],
  molds: {
    heading: msg("Plugs & molds from our workshop"),
    copy: msg("Finished tooling for composite hulls and decks, produced at the Emirates Boats Tooling Center."),
    images: [
      { src: asset("tooling-mold-1"), alt: msg("High-gloss black deck plug") },
      { src: asset("tooling-mold-2"), alt: msg("Green production mold for a deck component") },
      { src: asset("tooling-mold-3"), alt: msg("Hull plug with a polished dark finish") },
      { src: asset("tooling-mold-4"), alt: msg("Green hull mold seen from the bow") },
    ],
  },
};

/* ── Hydraulic swim platforms ─────────────────────────────────────────── */

export const HYDRAULICS = {
  kicker: msg("Swim platforms · Hydraulics"),
  title: msg("Hydraulic swim platforms with digital monitoring."),
  lede: msg("Supply and installation. H+B technics, Besenzoni and Opacmare."),
  hero: asset("hydraulics-main"),
  heroAlt: msg("Dark hydraulic swim platform wrapped around four Mercury V12 600 outboards"),
  intro: {
    kicker: msg("From the water to the deck"),
    heading: msg("The platform that does the work."),
    copy: msg("We fit electro-hydraulic swim platforms from the leading European makers, specified to your boat and installed at our Jebel Ali yard, with digital monitoring."),
  },
  stats: [
    { value: "3", label: msg("Partner brands") },
    { value: msg("Electro-hydraulic"), label: msg("Raise and lower") },
    { value: msg("Teak"), label: msg("Surface, stainless frame") },
    { value: msg("Safety locks"), label: msg("And stanchions") },
  ],
  fitted: {
    heading: msg("Fitted on the EB 63 Extended Cabin"),
    copy: msg("Photographed on our own boat."),
    photos: [
      { src: asset("hydraulics-transom"), title: msg("At the transom"), copy: msg("A dark, flush platform wraps around four Mercury V12 600 outboards.") },
      { src: asset("hydraulics-cockpit"), title: msg("Flush with the cockpit"), copy: msg("The Sea Deck cockpit floor runs aft to the platform edge.") },
      { src: asset("hydraulics-dock"), title: msg("At the dock"), copy: msg("The EB 63 Extended Cabin on the dock, platform and engines astern.") },
      { src: asset("hydraulics-name"), title: msg("Our name on it"), copy: msg("The platform surface carries the Emirates Boats name.") },
    ],
  },
  benefits: {
    heading: msg("One piece of equipment, several jobs."),
    items: [
      { title: msg("Swim and board"), copy: msg("Lowers to the water for swimming and boarding, and raises to become deck space when you cruise.") },
      { title: msg("Lift tenders and jet skis"), copy: msg("Besenzoni and Opacmare platforms also work as lifts for tenders and jet skis.") },
      { title: msg("Reach the quay"), copy: msg("A tipping end section on the Besenzoni LP 100 Plus extends the last step to the quay.") },
      { title: msg("Safe in use"), copy: msg("Automatic or hydraulic safety locking, removable stanchions, teak surface on a stainless frame.") },
      { title: msg("Digital monitoring"), copy: msg("Specified with digital monitoring, so the platform's status can be watched from the boat's control system.") },
      { title: msg("Made for your boat"), copy: msg("H+B technics, Besenzoni and Opacmare all build to the size and layout of the vessel.") },
    ],
  },
  brands: {
    heading: msg("Our partner brands"),
    copy: msg("Details as published by each maker. We help you choose the model that fits your boat."),
    items: [
      { name: "H+B technics", detail: msg("Münster, Germany"), copy: msg("Lifting systems for yachts since 1995, mostly hydraulic and custom-engineered. The ASCENDER is a remote-controlled lifting swim platform in 316L stainless steel, with integrated steps, twin-cylinder positioning and safety locking.") },
      { name: "Besenzoni", detail: msg("LP 100 Plus"), copy: msg("Hydraulic raise and lower, with a tipping end section for the quay. Stainless structure, teak surface, double row of removable stanchions. 1,943 mm long, 150–600 kg capacity, built to suit the boat.") },
      { name: "Opacmare", detail: msg("3383 Series"), copy: msg("Transom-mounted, hydraulically powered. Works as a passerelle, swim ladder, tender lift and loading platform, and triples the stern platform when fully open. Twelve versions with 4, 5 or 6 steps.") },
    ],
  },
  process: [msg("Structural check of the vessel"), msg("Choose brand and model"), msg("Install at our yard"), msg("Test and commission")],
};

export const SIGNATURE_IMAGES = {
  painting: asset("finish-gunmetal-grey-golden"),
  tooling: asset("tooling-step-07"),
  hydraulics: asset("hydraulics-main"),
};
