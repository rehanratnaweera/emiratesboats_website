import { useMemo, useState } from "react";
import type { BoatImage } from "../cms";
import { useI18n } from "../i18n";
import Lightbox from "./Lightbox";

/** Column spans (out of six) for each row of the mosaic, repeated down the page. */
const ROWS = [
  [4, 2],
  [2, 2, 2],
  [3, 3],
  [2, 4],
  [2, 2, 2],
];

/** Spans for `count` tiles, arranged so the final row is always full. */
function mosaicSpans(count: number) {
  const spans: number[] = [];
  let remaining = count;
  for (let row = 0; remaining > 0; row += 1) {
    let template = ROWS[row % ROWS.length];
    if (remaining === 1) template = [6];
    else if (remaining === 2) template = template.length === 2 ? template : [3, 3];
    else if (remaining === 3) template = [2, 2, 2];
    else if (remaining - template.length === 1) template = template.length === 3 ? [3, 3] : [2, 2, 2];
    spans.push(...template);
    remaining -= template.length;
  }
  return spans;
}

/**
 * Photograph mosaic for a boat. Tiles use resized CMS images; photographs the CMS
 * cannot resize are kept out of the grid and open at full resolution in the viewer.
 */
export default function Gallery({ images, label }: { images: BoatImage[]; label: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();
  const { tiles, ordered, extra } = useMemo(() => {
    const optimised = images.filter((image) => image.optimised);
    const originals = images.filter((image) => !image.optimised);
    return { tiles: optimised, ordered: [...optimised, ...originals], extra: originals.length };
  }, [images]);

  if (ordered.length === 0) return null;
  const spans = mosaicSpans(tiles.length + (extra > 0 ? 1 : 0));

  return (
    <>
      <div className="gallery">
        {tiles.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="gallery-tile"
            style={{ "--span": spans[index] } as React.CSSProperties}
            onClick={() => setOpenIndex(index)}
            aria-label={[t("Open photograph {number} of {total}", { number: index + 1, total: ordered.length }), image.title].filter(Boolean).join(": ")}
          >
            <img
              src={image.thumb}
              srcSet={image.srcSet}
              sizes={`(min-width: 760px) ${Math.round((spans[index] / 6) * 100)}vw, 100vw`}
              alt={image.alt}
              loading="lazy"
              decoding="async"
            />
            {(image.title || image.description) && (
              <span className="gallery-caption">
                {image.title && <span className="gallery-caption-title">{image.title}</span>}
                {image.description && <span className="gallery-caption-copy">{image.description}</span>}
              </span>
            )}
          </button>
        ))}
        {extra > 0 && (
          <button
            type="button"
            className="gallery-tile gallery-more"
            style={{ "--span": spans[tiles.length] } as React.CSSProperties}
            onClick={() => setOpenIndex(tiles.length)}
          >
            <span className="gallery-more-count">{tiles.length > 0 ? `+${extra}` : extra}</span>
            <span className="gallery-more-label">{tiles.length > 0 ? t("more photographs") : t("photographs")}</span>
            <span className="gallery-more-note">{t("Full-resolution originals")}</span>
          </button>
        )}
      </div>

      {openIndex !== null && <Lightbox images={ordered} index={openIndex} label={label} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />}
    </>
  );
}
