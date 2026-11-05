import type { BoatModel } from "./cmsfetch";

/** A numeric value pulled out of a free-text CMS spec field. */
export interface Measure {
  value: number;
  unit: string;
  decimals: number;
}

export interface PerformanceFact {
  label: string;
  measure: Measure;
  detail?: string;
}

/** First "<number> <unit>" in a spec string: "82 mph MAX / 60 mph Cruise" -> 82 mph. */
export function firstMeasure(text: string): Measure | undefined {
  const match = text.match(/(\d[\d,]*(?:\.\d+)?)\s*([a-z]+)/i);
  if (!match) return undefined;
  const raw = match[1].replace(/,/g, "");
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return { value, unit: match[2].toLowerCase(), decimals: raw.split(".")[1]?.length ?? 0 };
}

/** Total output from "3000 hp" or an engine count like "6 x Mercury 500R" -> 3000 hp. */
export function combinedHorsepower(power: string): Measure | undefined {
  const explicit = firstMeasure(power);
  if (explicit?.unit === "hp") return explicit;

  const match = power.match(/(\d+)\s*[x×]\s*\D*?(\d{3,4})/i);
  if (!match) return undefined;
  const value = Number(match[1]) * Number(match[2]);
  return value > 0 ? { value, unit: "hp", decimals: 0 } : undefined;
}

/** Text after the first "/" in fields like "63 ft / 19.2 m", used as a secondary line. */
function secondaryPart(text: string) {
  return text.split("/")[1]?.trim() || undefined;
}

/** Headline numbers for a boat; entries whose CMS text can't be parsed are dropped. */
export function performanceFacts(boat: BoatModel): PerformanceFact[] {
  const facts: Array<PerformanceFact | undefined> = [
    withMeasure("Combined output", combinedHorsepower(boat.power), boat.power),
    withMeasure("Top speed", firstMeasure(boat.speed), secondaryPart(boat.speed)),
    withMeasure("Range", firstMeasure(boat.range)),
    withMeasure("Length overall", firstMeasure(boat.length), secondaryPart(boat.length)),
  ];
  return facts.filter((fact): fact is PerformanceFact => Boolean(fact));
}

function withMeasure(label: string, measure: Measure | undefined, detail?: string): PerformanceFact | undefined {
  return measure ? { label, measure, detail } : undefined;
}

/** "EB-63 Center Console" from name + the last segment of "63 ft · Center Console". */
export function fleetLinkLabel(boat: BoatModel) {
  const type = boat.tagline.split("·").pop()?.trim();
  return type ? `${boat.name} ${type}` : boat.name;
}
