import painting from "../assets/services/finish-electric-blue-golden.webp";
import antifouling from "../assets/services/index-antifouling.webp";
import maintenance from "../assets/services/index-maintenance.webp";
import structuralRepair from "../assets/services/index-structuralRepair.webp";
import hydraulics from "../assets/services/index-hydraulics.webp";
import electrical from "../assets/services/index-electrical.webp";
import lighting from "../assets/services/index-lighting.webp";
import navigation from "../assets/services/index-navigation.webp";
import interior from "../assets/services/index-interior.webp";
import carpentry from "../assets/services/index-carpentry.webp";
import accessories from "../assets/services/index-accessories.webp";
import cnc from "../assets/services/index-cnc.webp";

export interface Service {
  id: string;
  name: string;
  tagline: string;
  points: string[];
  image: string;
  imageAlt: string;
  /** Slug of the in-depth page, for the services that have one. */
  page?: string;
}

export const SERVICES_INTRO = {
  title: "One yard. Every service.",
  columns: [
    {
      heading: "Built by boat builders",
      copy: "Emirates Boats LLC doesn't only build boats — we look after them. The same naval architecture, composite know-how and factory-quality finishing behind the EB46, EB63 and our catamaran range now serve your boat, from a single coat of paint to a complete system refit.",
    },
    {
      heading: "Every trade under one roof",
      copy: "Design office, 5-axis CNC milling, carpentry, composite lamination, electrical and electronics installation, upholstery and a Cromax® paint facility — all at our Jebel Ali workshop. One team, one schedule and one point of contact for the whole job.",
    },
  ],
} as const;

export const SERVICES: Service[] = [
  {
    id: "painting",
    name: "Boat Painting",
    tagline: "Cromax® finishes in 240 colors",
    points: ["Full hull & topside refinishing", "Custom multi-tone graphics & color matching", "Cromax® basecoat with UV clearcoat", "Engine cowling painting & graphics"],
    image: painting,
    imageAlt: "Center console in an electric blue finish at golden hour",
    page: "painting",
  },
  {
    id: "antifouling",
    name: "Antifouling & Cleaning",
    tagline: "Keep the hull fast, clean and protected",
    points: ["Hull cleaning & polishing", "Antifouling coating application", "Propeller & running-gear cleaning", "Anode & through-hull checks"],
    image: antifouling,
    imageAlt: "Center console with a clean white hull running through clear water",
  },
  {
    id: "maintenance",
    name: "Maintenance & Repair",
    tagline: "Scheduled care and fast fixes",
    points: ["Engine & outboard servicing", "Systems diagnostics & fault finding", "Seasonal & pre-trip inspections", "Spare parts sourcing & supply"],
    image: maintenance,
    imageAlt: "Marine generator installed in a clean machinery space",
  },
  {
    id: "structural-repair",
    name: "Structural Repair",
    tagline: "Structural and composite repair",
    points: ["Hull, deck & gelcoat repair", "Fiberglass & carbon laminate work", "Collision & damage restoration", "Finishing and paint matched to the hull"],
    image: structuralRepair,
    imageAlt: "Technician applying compound to a composite surface",
  },
  {
    id: "hydraulics",
    name: "Swim Platform Hydraulics",
    tagline: "Platforms that move at a touch",
    points: ["Hydraulic swim platform design & install", "Pumps, rams & control systems", "Retrofit to existing boats", "Stainless hardware, marine-grade finish"],
    image: hydraulics,
    imageAlt: "Hydraulic swim platform wrapped around four outboard engines",
    page: "hydraulics",
  },
  {
    id: "electrical",
    name: "Electrical Systems",
    tagline: "Power you can trust at sea",
    points: ["C-Zone digital switching & monitoring", "Li-ion battery banks, chargers & inverters", "Shore power & generator installation", "Wiring audits, upgrades & fault finding"],
    image: electrical,
    imageAlt: "Neatly wired inverter and charging equipment",
  },
  {
    id: "lighting",
    name: "Boat Lighting",
    tagline: "Set the mood on deck and below",
    points: ["RGB deck & cabin lighting", "Underwater lights", "Flood, spreader & gunwale lights", "One-touch lighting scenes"],
    image: lighting,
    imageAlt: "Underwater lights glowing green beneath six outboard engines at night",
  },
  {
    id: "navigation",
    name: "Navigation Systems",
    tagline: "See further, navigate smarter",
    points: ["Multi-function display (MFD) installation", "Radar, sonar & fishfinder", "Autopilot, AIS & VHF radio", "Night-vision & CCTV cameras"],
    image: navigation,
    imageAlt: "Helm with three navigation displays",
  },
  {
    id: "interior",
    name: "Boat Interior",
    tagline: "Comfort, made to measure",
    points: ["Custom upholstery & seating", "Cabin fit-out & wraparound panels", "SeaDeck & teak-style decking", "Galley, head & storage compartments"],
    image: interior,
    imageAlt: "Cabin interior with teak-style decking and fitted furniture",
  },
  {
    id: "carpentry",
    name: "Boat Carpentry",
    tagline: "Marine joinery, built in-house",
    points: ["Custom cabinets, tables & furniture", "Stairs, panels & trim", "Plywood & timber structural work", "Templates, cradles & jigs"],
    image: carpentry,
    imageAlt: "Carpenters building a large timber base in the workshop",
  },
  {
    id: "accessories",
    name: "Boat Accessories",
    tagline: "Fit-out for the way you boat",
    points: ["Premium audio & entertainment", "Cleats, rod holders & deck hardware", "Fenders, covers & shade solutions", "Anchor & windlass systems"],
    image: accessories,
    imageAlt: "Marine speaker with red accent lighting",
  },
  {
    id: "cnc",
    name: "5-Axis CNC Service",
    tagline: "Plug, mold & part milling",
    points: ["Plug & mold milling from your CAD files", "Working envelope up to 24 × 7.5 × 4.2 m", "Finishing: sanding, primer & high-gloss", "Tooling for composite infusion"],
    image: cnc,
    imageAlt: "5-axis milling cutter shaping a plug",
    page: "tooling",
  },
];

export const SERVICE_PROCESS = [
  { title: "Survey & quote", copy: "We inspect your boat and agree scope and price." },
  { title: "Plan & materials", copy: "Parts, paint and systems specified and ordered." },
  { title: "Workshop work", copy: "Engineers and craftspeople at our Jebel Ali facility." },
  { title: "Quality check", copy: "Every job checked before it leaves the yard." },
  { title: "Handover & follow-up", copy: "Your boat returned with support after the job." },
] as const;

export const SERVICE_QUOTE = {
  title: "Tell us the job. We'll plan it.",
  copy: "Send your boat model, the service you need and your target date. We'll survey, quote and schedule the work with you.",
} as const;

/** Titles of the in-depth service pages, keyed by route slug. */
export const SERVICE_PAGES: Record<string, { title: string; interest: string }> = {
  painting: { title: "Marine Painting & Refinishing", interest: "Boat Painting" },
  tooling: { title: "Tooling Center · 5-Axis CNC", interest: "5-Axis CNC Service" },
  hydraulics: { title: "Hydraulic Swim Platforms", interest: "Swim Platform Hydraulics" },
};
