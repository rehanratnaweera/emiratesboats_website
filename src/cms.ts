/**
 * Directus client. The fleet, every boat photograph, and the title/description
 * shown with each photograph are read from the CMS at runtime.
 */

export interface BoatImage {
  id: string;
  alt: string;
  /** Caption heading: the file's Title in Directus, when someone has written one. */
  title: string;
  /** Caption body: the file's Description in Directus. */
  description: string;
  /** False when Directus cannot resize the file, so only the original can be shown. */
  optimised: boolean;
  /** Width / height, when the CMS knows the dimensions. */
  aspectRatio?: number;
  thumb: string;
  medium: string;
  large: string;
  /** Responsive candidates for grid tiles; undefined for originals. */
  srcSet?: string;
}

export interface BoatModel {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  datasheetUrl: string;
  /** e.g. "PDF · 0.8 MB" */
  datasheetMeta: string;
  /** First photograph that can be optimised; used for hero and fleet imagery. */
  lead?: BoatImage;
  gallery: BoatImage[];
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

import { msg } from "./i18n";

export const DIRECTUS_URL = "https://cms.emirateboats.com";
const ASSET_ROOT = `${DIRECTUS_URL}/assets/`;

type DirectusRecord = Record<string, unknown>;

interface ImageTransform {
  width: number;
  height?: number;
  quality?: number;
}

/**
 * URL for a Directus image asset resized and re-encoded as WebP. Originals in the
 * CMS are multi-megabyte camera JPEGs, so never render them at full size.
 */
export function cmsImage(id: string, { width, height, quality = 72 }: ImageTransform) {
  const params = new URLSearchParams({ width: String(width), quality: String(quality), format: "webp" });
  if (height) {
    params.set("height", String(height));
    params.set("fit", "cover");
  }
  return `${ASSET_ROOT}${id}?${params}`;
}

/** Curated site-level media stored in the CMS (not tied to a boat record). */
export const SITE_MEDIA = {
  logo: `${ASSET_ROOT}b693203a-b37c-47ce-be08-2d9dfc9428ec`,
  heroVideo: `${ASSET_ROOT}044420c8-8e1e-4c11-8c2d-4de5cc24fb13`,
  /** Matches the first frame of the hero video loop; shown while the video loads. */
  heroPoster: cmsImage("9f26a4aa-c647-4f0f-9719-e7c81ab4608c", { width: 1920, quality: 68 }),
  craft: {
    url: cmsImage("93bf4894-8385-44ea-8cd6-2ad35d045af8", { width: 1400, height: 1050 }),
    alt: msg("EB-63 center console in profile at the marina"),
  },
  craftDetails: [
    { url: cmsImage("f3ad6b10-ed70-4093-ad43-dbf0ecd5f200", { width: 900, height: 640 }), alt: msg("EB-63 helm with triple navigation displays") },
    { url: cmsImage("91e91824-0729-4b65-af15-4b036407de37", { width: 900, height: 640 }), alt: msg("EB-63 electronics console with touchscreen controls") },
    { url: cmsImage("f3dd5bea-5c57-4ff1-9682-e8b3db26ba30", { width: 900, height: 640 }), alt: msg("Radar domes and thermal camera on the EB-63 hardtop") },
  ],
} as const;

function firstValue(record: DirectusRecord, ...keys: string[]) {
  return keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "");
}

function text(record: DirectusRecord, ...keys: string[]) {
  return String(firstValue(record, ...keys) ?? "").trim();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function fileRecord(asset: unknown): DirectusRecord | undefined {
  if (typeof asset === "string") return { id: asset };
  if (!asset || typeof asset !== "object") return undefined;
  const value = asset as DirectusRecord;
  return value.directus_files_id ? fileRecord(value.directus_files_id) : value;
}

function compact(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Directus fills Title from the filename on upload ("DSC01095.JPG" -> "Ds C01095").
 * Those are not captions, so a title only counts once someone has rewritten it.
 */
function authoredTitle(file: DirectusRecord) {
  const title = text(file, "title");
  if (!title) return "";
  const filename = text(file, "filename_download").replace(/\.[a-z0-9]+$/i, "");
  return compact(title) === compact(filename) ? "" : title;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const megabytes = bytes / 1_000_000;
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

const TILE_WIDTHS = [480, 800, 1280];

function mapImage(asset: unknown, boatName: string, index: number): BoatImage | undefined {
  const file = fileRecord(asset);
  if (!file || typeof file.id !== "string") return undefined;
  if (typeof file.type === "string" && !file.type.startsWith("image/")) return undefined;

  const id = file.id;
  const title = authoredTitle(file);
  const description = text(file, "description");
  const width = Number(file.width);
  const height = Number(file.height);
  // Directus rejects transforms for files it has no dimensions for.
  const optimised = width > 0 && height > 0;
  const original = `${ASSET_ROOT}${id}`;

  return {
    id,
    title,
    description,
    alt: title || description || `${boatName} photograph ${index + 1}`,
    optimised,
    aspectRatio: optimised ? width / height : undefined,
    thumb: optimised ? cmsImage(id, { width: 640 }) : original,
    medium: optimised ? cmsImage(id, { width: 1280 }) : original,
    large: optimised ? cmsImage(id, { width: 2400, quality: 80 }) : original,
    srcSet: optimised ? TILE_WIDTHS.map((w) => `${cmsImage(id, { width: w })} ${w}w`).join(", ") : undefined,
  };
}

function mapGallery(record: DirectusRecord, boatName: string): BoatImage[] {
  const source = firstValue(record, "gallery", "boat_images", "images", "gallery_images");
  const items = Array.isArray(source) ? source : source ? [source] : [];
  const seen = new Set<string>();
  return items
    .map((item, index) => mapImage(item, boatName, index))
    .filter((image): image is BoatImage => {
      if (!image || seen.has(image.id)) return false;
      seen.add(image.id);
      return true;
    });
}

function mapBoat(record: DirectusRecord): BoatModel {
  const name = text(record, "name", "title") || "Emirates Boats";
  const gallery = mapGallery(record, name);
  const datasheet = fileRecord(firstValue(record, "datasheet_file", "datasheet"));
  const datasheetSize = datasheet ? formatFileSize(Number(datasheet.filesize)) : "";

  return {
    id: text(record, "id") || slugify(name),
    slug: text(record, "slug") || slugify(name),
    name,
    tagline: text(record, "tagline", "subtitle"),
    datasheetUrl: datasheet && typeof datasheet.id === "string" ? `${ASSET_ROOT}${datasheet.id}?download` : "",
    datasheetMeta: ["PDF", datasheetSize].filter(Boolean).join(" · "),
    lead: gallery.find((image) => image.optimised),
    gallery,
    length: text(record, "length", "loa"),
    beam: text(record, "beam"),
    displacement: text(record, "displacement"),
    range: text(record, "range"),
    power: text(record, "power", "propulsion"),
    speed: text(record, "speed"),
    capacity: text(record, "capacity"),
    construction: text(record, "construction"),
    description: text(record, "description", "brief", "overview"),
  };
}

export async function fetchBoats(signal?: AbortSignal): Promise<BoatModel[]> {
  const query = new URLSearchParams({
    limit: "100",
    sort: "sort",
    fields: "*,datasheet_file.*,gallery.*,gallery.directus_files_id.*",
  });
  query.set("filter[status][_eq]", "published");
  const response = await fetch(`${DIRECTUS_URL}/items/boats?${query}`, { signal });
  if (!response.ok) throw new Error(`Directus request failed (${response.status})`);

  const payload = (await response.json()) as { data?: DirectusRecord[] };
  if (!Array.isArray(payload.data)) throw new Error("Directus returned an invalid boats response");
  return payload.data.map(mapBoat);
}
