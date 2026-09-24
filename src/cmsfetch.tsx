import type { BoatMaterialColors } from "./components/BoatViewer";

export interface BoatGalleryImage {
  url: string;
  alt: string;
}

export interface BoatModel {
  id: string;
  name: string;
  tagline: string;
  modelUrl: string;
  datasheetUrl: string;
  gallery: BoatGalleryImage[];
  materialColors: BoatMaterialColors;
  zoomFactor: number;
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

const DIRECTUS_URL = "https://cms.emirateboats.com";
const ASSET_ROOT = `${DIRECTUS_URL}/assets/`;

type DirectusAsset = string | { id?: string; filename_download?: string; title?: string; description?: string; url?: string };
type DirectusRecord = Record<string, unknown>;

function firstValue(record: DirectusRecord, ...keys: string[]) {
  return keys.map((key) => record[key]).find((value) => value !== undefined && value !== null && value !== "");
}

function text(record: DirectusRecord, ...keys: string[]) {
  return String(firstValue(record, ...keys) ?? "");
}

function assetUrl(asset: unknown): string {
  if (typeof asset === "string") return asset.startsWith("http") ? asset : `${ASSET_ROOT}${asset}`;
  if (!asset || typeof asset !== "object") return "";
  const value = asset as DirectusRecord;
  if (typeof value.url === "string") return value.url;
  if (typeof value.id === "string") return `${ASSET_ROOT}${value.id}`;
  if (value.directus_files_id) return assetUrl(value.directus_files_id);
  return "";
}

function assetAlt(asset: unknown, fallback: string) {
  if (asset && typeof asset === "object") {
    const value = asset as DirectusRecord;
    return String(value.title ?? value.filename_download ?? value.description ?? fallback);
  }
  return fallback;
}

function numberValue(record: DirectusRecord, fallback: number, ...keys: string[]) {
  const value = Number(firstValue(record, ...keys));
  return Number.isFinite(value) ? value : fallback;
}

function colorValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().replace(/^#/, "");
  if (!/^[\da-f]{6}$/i.test(normalized)) return undefined;
  return Number.parseInt(normalized, 16);
}

function materialColors(record: DirectusRecord): BoatMaterialColors {
  const source = firstValue(record, "materialColors", "material_colors", "materials");
  if (Array.isArray(source)) {
    return Object.fromEntries(
      source
        .map((entry) => {
          if (!entry || typeof entry !== "object") return undefined;
          const material = entry as DirectusRecord;
          const meshName = firstValue(material, "mesh_name", "meshName", "material_key", "key", "name");
          const color = colorValue(firstValue(material, "color", "colour"));
          return typeof meshName === "string" && color !== undefined ? [meshName, color] : undefined;
        })
        .filter((entry): entry is [string, number] => Boolean(entry))
    );
  }

  if (!source || typeof source !== "object") return {};
  const colors: BoatMaterialColors = {};
  Object.entries(source as DirectusRecord).forEach(([key, value]) => {
    const color = colorValue(value);
    if (color !== undefined) colors[key] = color;
  });
  return colors;
}

function gallery(record: DirectusRecord, name: string): BoatGalleryImage[] {
  const source = firstValue(record, "gallery", "boat_images", "images", "gallery_images");
  const items = Array.isArray(source) ? source : source ? [source] : [];
  return items
    .map((item, index) => ({
      url: assetUrl(item),
      alt: assetAlt(item, `${name} view ${index + 1}`),
    }))
    .filter((item) => item.url);
}

function mapBoat(record: DirectusRecord): BoatModel {
  const id = text(record, "id", "slug", "model") || crypto.randomUUID();
  const name = text(record, "name", "title") || id;
  const rawGallery = gallery(record, name);

  return {
    id,
    name,
    tagline: text(record, "tagline", "subtitle", "type"),
    modelUrl: assetUrl(firstValue(record, "model_file", "modelUrl", "model_url", "model", "glb", "three_model")),
    datasheetUrl: assetUrl(firstValue(record, "datasheet_file", "datasheetUrl", "datasheet_url", "datasheet", "specsheet")),
    gallery: rawGallery,
    materialColors: materialColors(record),
    zoomFactor: numberValue(record, 1, "zoomFactor", "zoom_factor", "zoom"),
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
    fields: "*,model_file.*,datasheet_file.*,gallery.*,gallery.directus_files_id.*,material_colors.*",
  });
  const response = await fetch(`${DIRECTUS_URL}/items/boats?${query}`, { signal });
  if (!response.ok) throw new Error(`Directus request failed (${response.status})`);

  const payload = (await response.json()) as { data?: DirectusRecord[] };
  if (!Array.isArray(payload.data)) throw new Error("Directus returned an invalid boats response");
  return payload.data.map(mapBoat);
}
