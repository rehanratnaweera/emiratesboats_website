import { msg } from "../i18n";

/** Company-level facts shown across the site. */
export const COMPANY = {
  name: "Emirates Boats LLC",
  yard: "Jebel Ali Industrial 1",
  postal: "P.O. Box 212300, Dubai, UAE",
  phone: "+971 4 880 4777",
  phoneHref: "tel:+97148804777",
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/emiratesboat" },
    { label: "Facebook", href: "https://www.facebook.com/emiratesboats" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/emirates-boats-llc" },
  ],
} as const;

export const DEVELOPER_INFO = {
  name: "Rehan Rathnaweera",
  href: "https://github.com/rehanratnaweera",
} as const;

/** Point of contact for the service department. */
export const SERVICE_DESK = {
  name: "Salah Amir Mosbah",
  role: msg("Services & Engineering"),
  phone: "+971 52 509 2200",
  phoneHref: "tel:+971525092200",
  email: "salah@emirateboats.com",
} as const;

/** Show notice in the hero. It removes itself once the show has closed. */
export const BOAT_SHOW = {
  name: msg("Abu Dhabi International Boat Show"),
  dates: msg("19–22 November 2026"),
  venue: "M036/E005B/E005A, Marina Hall, ADNEC Centre",
  endsAt: "2026-11-22T23:59:59+04:00",
} as const;

export function boatShowIsCurrent(now = Date.now()) {
  return now <= Date.parse(BOAT_SHOW.endsAt);
}

export const BUILD_STAGES = [
  { number: "01", title: msg("Hull Analysis"), copy: msg("FEA and CFD model run for Gulf sea states before a single layer of glass or carbon is cut.") },
  { number: "02", title: msg("Lamination"), copy: msg("Pre-preg carbon (Cat 80) or infused vinylester (center consoles) laid in climate-controlled bays.") },
  { number: "03", title: msg("Systems Fit-Out"), copy: msg("Electronics, rigging, fuel, and propulsion installed and independently certified before launch.") },
  { number: "04", title: msg("Sea Trial"), copy: msg("Full-speed runs to rated maximum, instrument calibration, and customer handover in Dubai Marina.") },
] as const;
