import type { BoatMaterialColors, BoatModelEffect } from "./components/BoatViewer";

export interface BoatConfigurationOption {
  id: string;
  key: string;
  label: string;
  description: string;
  swatchColor: string;
  isDefault: boolean;
  isActive: boolean;
  sort: number;
  effects: BoatModelEffect[];
}

export interface BoatConfigurationGroup {
  id: string;
  key: string;
  label: string;
  selectionMode: "single" | "multiple";
  sort: number;
  options: BoatConfigurationOption[];
}

export interface BoatGalleryImage {
  /** ~1600px display size */
  url: string;
  /** small thumbnail strip size */
  thumbUrl: string;
  /** lightbox size */
  largeUrl: string;
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
  configurationGroups: BoatConfigurationGroup[];
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
  performance: cmsImage("b0ad7e43-3a43-4e6b-a16c-941c60f453c9", { width: 2000, quality: 70 }),
  construction: cmsImage("93bf4894-8385-44ea-8cd6-2ad35d045af8", { width: 1200, height: 800 }),
  detailStrip: [
    { url: cmsImage("f3ad6b10-ed70-4093-ad43-dbf0ecd5f200", { width: 900, height: 640 }), alt: "EB-63 helm with triple navigation displays" },
    { url: cmsImage("91e91824-0729-4b65-af15-4b036407de37", { width: 900, height: 640 }), alt: "EB-63 electronics console with touchscreen controls" },
    { url: cmsImage("f3dd5bea-5c57-4ff1-9682-e8b3db26ba30", { width: 900, height: 640 }), alt: "Radar domes and thermal camera on the EB-63 hardtop" },
  ],
} as const;

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

function colorHex(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().replace(/^#/, "");
  return /^[\da-f]{6}$/i.test(normalized) ? `#${normalized.toLowerCase()}` : "";
}

function records(value: unknown): DirectusRecord[] {
  const items = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
  return items.filter((item): item is DirectusRecord => Boolean(item) && typeof item === "object");
}

function configurationGroups(value: unknown): BoatConfigurationGroup[] {
  return records(value)
    .map((group): BoatConfigurationGroup => ({
      id: text(group, "id"),
      key: text(group, "key"),
      label: text(group, "label"),
      selectionMode: text(group, "selection_mode") === "multiple" ? "multiple" : "single",
      sort: numberValue(group, 0, "sort"),
      options: records(group.options)
        .map((option): BoatConfigurationOption => ({
          id: text(option, "id"),
          key: text(option, "key"),
          label: text(option, "label"),
          description: text(option, "description"),
          swatchColor: colorHex(option.swatch_color),
          isDefault: option.is_default === true,
          isActive: option.is_active !== false,
          sort: numberValue(option, 0, "sort"),
          effects: records(option.effects)
            .map((effect): BoatModelEffect | null => {
              const effectType = text(effect, "effect_type");
              if (effectType !== "color" && effectType !== "visibility" && effectType !== "asset_variant") return null;
              return {
                id: text(effect, "id"),
                type: effectType,
                targetName: text(effect, "target_name"),
                color: colorValue(effect.color),
                visible: typeof effect.visible === "boolean" ? effect.visible : undefined,
                assetUrl: assetUrl(effect.asset_file),
                assetMode: text(effect, "asset_mode") === "replace" ? "replace" : "overlay",
                sort: numberValue(effect, 0, "sort"),
              };
            })
            .filter((effect): effect is BoatModelEffect => effect !== null)
            .sort((left, right) => left.sort - right.sort),
        }))
        .filter((option) => option.isActive)
        .sort((left, right) => left.sort - right.sort),
    }))
    .sort((left, right) => left.sort - right.sort);
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

/**
 * Directus rejects transforms for files it has no dimensions for (some uploads are
 * missing that metadata), so only request resized variants when width/height exist.
 */
function transformableImageId(asset: unknown): string | undefined {
  if (!asset || typeof asset !== "object") return undefined;
  const value = asset as DirectusRecord;
  if (value.directus_files_id) return transformableImageId(value.directus_files_id);
  const isImage = typeof value.type !== "string" || value.type.startsWith("image/");
  return typeof value.id === "string" && isImage && Number(value.width) > 0 && Number(value.height) > 0 ? value.id : undefined;
}

function gallery(record: DirectusRecord, name: string): BoatGalleryImage[] {
  const source = firstValue(record, "gallery", "boat_images", "images", "gallery_images");
  const items = Array.isArray(source) ? source : source ? [source] : [];
  return items
    .map((item, index) => {
      const original = assetUrl(item);
      const id = transformableImageId(item);
      return {
        url: id ? cmsImage(id, { width: 1600 }) : original,
        thumbUrl: id ? cmsImage(id, { width: 320, height: 220 }) : original,
        largeUrl: id ? cmsImage(id, { width: 2560, quality: 80 }) : original,
        alt: assetAlt(item, `${name} view ${index + 1}`),
      };
    })
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
    configurationGroups: configurationGroups(record.configuration_groups),
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
    fields: "*,model_file.*,datasheet_file.*,gallery.*,gallery.directus_files_id.*,material_colors.*,configuration_groups.*,configuration_groups.options.*,configuration_groups.options.effects.*,configuration_groups.options.effects.asset_file.*",
  });
  query.set("filter[status][_eq]", "published");
  const response = await fetch(`${DIRECTUS_URL}/items/boats?${query}`, { signal });
  if (!response.ok) throw new Error(`Directus request failed (${response.status})`);

  const payload = (await response.json()) as { data?: DirectusRecord[] };
  if (!Array.isArray(payload.data)) throw new Error("Directus returned an invalid boats response");
  return payload.data.map(mapBoat);
}
