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
import { msg } from "../i18n";

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
  title: msg("One yard. Every service."),
  columns: [
    {
      heading: msg("Built by boat builders"),
      copy: msg("Emirates Boats LLC doesn't only build boats — we look after them. The same naval architecture, composite know-how and factory-quality finishing behind the EB46, EB63 and our catamaran range now serve your boat, from a single coat of paint to a complete system refit."),
    },
    {
      heading: msg("Every trade under one roof"),
      copy: msg("Design office, 5-axis CNC milling, carpentry, composite lamination, electrical and electronics installation, upholstery and a Cromax® paint facility — all at our Jebel Ali workshop. One team, one schedule and one point of contact for the whole job."),
    },
  ],
} as const;

export const SERVICES: Service[] = [
  {
    id: "painting",
    name: msg("Boat Painting"),
    tagline: msg("Cromax® finishes in 240 colors"),
    points: [msg("Full hull & topside refinishing"), msg("Custom multi-tone graphics & color matching"), msg("Cromax® basecoat with UV clearcoat"), msg("Engine cowling painting & graphics")],
    image: painting,
    imageAlt: msg("Center console in an electric blue finish at golden hour"),
    page: "painting",
  },
  {
    id: "antifouling",
    name: msg("Antifouling & Cleaning"),
    tagline: msg("Keep the hull fast, clean and protected"),
    points: [msg("Hull cleaning & polishing"), msg("Antifouling coating application"), msg("Propeller & running-gear cleaning"), msg("Anode & through-hull checks")],
    image: antifouling,
    imageAlt: msg("Center console with a clean white hull running through clear water"),
  },
  {
    id: "maintenance",
    name: msg("Maintenance & Repair"),
    tagline: msg("Scheduled care and fast fixes"),
    points: [msg("Engine & outboard servicing"), msg("Systems diagnostics & fault finding"), msg("Seasonal & pre-trip inspections"), msg("Spare parts sourcing & supply")],
    image: maintenance,
    imageAlt: msg("Marine generator installed in a clean machinery space"),
  },
  {
    id: "structural-repair",
    name: msg("Structural Repair"),
    tagline: msg("Structural and composite repair"),
    points: [msg("Hull, deck & gelcoat repair"), msg("Fiberglass & carbon laminate work"), msg("Collision & damage restoration"), msg("Finishing and paint matched to the hull")],
    image: structuralRepair,
    imageAlt: msg("Technician applying compound to a composite surface"),
  },
  {
    id: "hydraulics",
    name: msg("Swim Platform Hydraulics"),
    tagline: msg("Platforms that move at a touch"),
    points: [msg("Hydraulic swim platform design & install"), msg("Pumps, rams & control systems"), msg("Retrofit to existing boats"), msg("Stainless hardware, marine-grade finish")],
    image: hydraulics,
    imageAlt: msg("Hydraulic swim platform wrapped around four outboard engines"),
    page: "hydraulics",
  },
  {
    id: "electrical",
    name: msg("Electrical Systems"),
    tagline: msg("Power you can trust at sea"),
    points: [msg("C-Zone digital switching & monitoring"), msg("Li-ion battery banks, chargers & inverters"), msg("Shore power & generator installation"), msg("Wiring audits, upgrades & fault finding")],
    image: electrical,
    imageAlt: msg("Neatly wired inverter and charging equipment"),
  },
  {
    id: "lighting",
    name: msg("Boat Lighting"),
    tagline: msg("Set the mood on deck and below"),
    points: [msg("RGB deck & cabin lighting"), msg("Underwater lights"), msg("Flood, spreader & gunwale lights"), msg("One-touch lighting scenes")],
    image: lighting,
    imageAlt: msg("Underwater lights glowing green beneath six outboard engines at night"),
  },
  {
    id: "navigation",
    name: msg("Navigation Systems"),
    tagline: msg("See further, navigate smarter"),
    points: [msg("Multi-function display (MFD) installation"), msg("Radar, sonar & fishfinder"), msg("Autopilot, AIS & VHF radio"), msg("Night-vision & CCTV cameras")],
    image: navigation,
    imageAlt: msg("Helm with three navigation displays"),
  },
  {
    id: "interior",
    name: msg("Boat Interior"),
    tagline: msg("Comfort, made to measure"),
    points: [msg("Custom upholstery & seating"), msg("Cabin fit-out & wraparound panels"), msg("SeaDeck & teak-style decking"), msg("Galley, head & storage compartments")],
    image: interior,
    imageAlt: msg("Cabin interior with teak-style decking and fitted furniture"),
  },
  {
    id: "carpentry",
    name: msg("Boat Carpentry"),
    tagline: msg("Marine joinery, built in-house"),
    points: [msg("Custom cabinets, tables & furniture"), msg("Stairs, panels & trim"), msg("Plywood & timber structural work"), msg("Templates, cradles & jigs")],
    image: carpentry,
    imageAlt: msg("Carpenters building a large timber base in the workshop"),
  },
  {
    id: "accessories",
    name: msg("Boat Accessories"),
    tagline: msg("Fit-out for the way you boat"),
    points: [msg("Premium audio & entertainment"), msg("Cleats, rod holders & deck hardware"), msg("Fenders, covers & shade solutions"), msg("Anchor & windlass systems")],
    image: accessories,
    imageAlt: msg("Marine speaker with red accent lighting"),
  },
  {
    id: "cnc",
    name: msg("5-Axis CNC Service"),
    tagline: msg("Plug, mold & part milling"),
    points: [msg("Plug & mold milling from your CAD files"), msg("Working envelope up to 24 × 7.5 × 4.2 m"), msg("Finishing: sanding, primer & high-gloss"), msg("Tooling for composite infusion")],
    image: cnc,
    imageAlt: msg("5-axis milling cutter shaping a plug"),
    page: "tooling",
  },
];

export const SERVICE_PROCESS = [
  { title: msg("Survey & quote"), copy: msg("We inspect your boat and agree scope and price.") },
  { title: msg("Plan & materials"), copy: msg("Parts, paint and systems specified and ordered.") },
  { title: msg("Workshop work"), copy: msg("Engineers and craftspeople at our Jebel Ali facility.") },
  { title: msg("Quality check"), copy: msg("Every job checked before it leaves the yard.") },
  { title: msg("Handover & follow-up"), copy: msg("Your boat returned with support after the job.") },
] as const;

export const SERVICE_QUOTE = {
  title: msg("Tell us the job. We'll plan it."),
  copy: msg("Send your boat model, the service you need and your target date. We'll survey, quote and schedule the work with you."),
} as const;

/** Titles of the in-depth service pages, keyed by route slug. */
export const SERVICE_PAGES: Record<string, { title: string; interest: string }> = {
  painting: { title: msg("Marine Painting & Refinishing"), interest: "Boat Painting" },
  tooling: { title: msg("Tooling Center · 5-Axis CNC"), interest: "5-Axis CNC Service" },
  hydraulics: { title: msg("Hydraulic Swim Platforms"), interest: "Swim Platform Hydraulics" },
};
