import { useEffect, useRef, useState } from "react";

interface BoatDetailsModel {
  id: string;
  name: string;
  tagline: string;
  length: string;
  beam: string;
  displacement: string;
  range: string;
  power: string;
  speed: string;
  capacity: string;
  construction: string;
  description: string;
  datasheetUrl: string;
  gallery: BoatGalleryImage[];
}

interface BoatGalleryImage {
  url: string;
  alt: string;
}

interface BoatDetailsProps {
  boat: BoatDetailsModel;
  onBack: () => void;
}

type BoatSpecKey = "length" | "beam" | "displacement" | "range" | "power" | "speed" | "capacity" | "construction";

const SPEC_FIELDS: Array<{ key: BoatSpecKey; label: string }> = [
  { key: "length", label: "LOA" },
  { key: "beam", label: "Beam" },
  { key: "displacement", label: "Displacement" },
  { key: "range", label: "Range" },
  { key: "power", label: "Propulsion" },
  { key: "speed", label: "Speed" },
  { key: "capacity", label: "Capacity" },
  { key: "construction", label: "Construction" },
];

export default function BoatDetails({ boat, onBack }: BoatDetailsProps) {
  const images = boat.gallery.length > 0
    ? boat.gallery
    : [{ url: "/images/logo.png", alt: `${boat.name} image unavailable` }];
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setActiveImage(0);
    setIsLightboxOpen(false);
    thumbnailRefs.current = [];
  }, [boat.id]);

  useEffect(() => {
    thumbnailRefs.current[activeImage]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeImage]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowLeft") setActiveImage((current) => (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveImage((current) => (current + 1) % images.length);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [images.length, isLightboxOpen]);

  const goToImage = (direction: number) => {
    setActiveImage((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div className="boat-details">
      <div className="boat-details-header">
        <div>
          <p className="boat-details-kicker">Specification sheet · {boat.tagline}</p>
          <h3>{boat.name}</h3>
        </div>
        <button className="boat-back-button" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to model
        </button>
      </div>

      <div className="boat-details-gallery" aria-label={`${boat.name} image gallery`}>
        <div className="boat-gallery-stage">
          <img src={images[activeImage].url} alt={images[activeImage].alt} />
          <div className="boat-gallery-index">{String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</div>
          <button className="boat-gallery-arrow boat-gallery-arrow-prev" type="button" onClick={() => goToImage(-1)} aria-label="Previous image">
            <span aria-hidden="true">←</span>
          </button>
          <button className="boat-gallery-arrow boat-gallery-arrow-next" type="button" onClick={() => goToImage(1)} aria-label="Next image">
            <span aria-hidden="true">→</span>
          </button>
          <button className="boat-gallery-expand" type="button" onClick={() => setIsLightboxOpen(true)} aria-label="Enlarge current image">
            <span aria-hidden="true">⛶</span> Expand image
          </button>
        </div>
        <div className="boat-gallery-thumbnails">
          {images.map((image, index) => (
            <button
              key={image.url}
              ref={(element) => { thumbnailRefs.current[index] = element; }}
              className={`boat-gallery-thumbnail ${index === activeImage ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveImage(index)}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === activeImage}
            >
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="boat-details-content">
        <div className="boat-details-specs">
          <div className="boat-details-section-heading">
            <p>Technical data</p>
            <span>{boat.name}</span>
          </div>
          <div className="boat-spec-grid">
            {SPEC_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <p>{label}</p>
                <strong>{boat[key]}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="boat-details-copy">
          <p className="boat-details-kicker">The brief</p>
          <p>{boat.description}</p>
          <a className="boat-download-button" href={boat.datasheetUrl} download>
            Download datasheet <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {isLightboxOpen && (
        <div className="boat-gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${boat.name} enlarged image`} onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsLightboxOpen(false);
        }}>
          <div className="boat-lightbox-toolbar">
            <p>{boat.name} · {String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</p>
            <button type="button" onClick={() => setIsLightboxOpen(false)} aria-label="Close enlarged image">Close <span aria-hidden="true">×</span></button>
          </div>
          <div className="boat-lightbox-image-wrap">
            <img src={images[activeImage].url} alt={images[activeImage].alt} />
          </div>
          <button className="boat-lightbox-arrow boat-lightbox-prev" type="button" onClick={() => goToImage(-1)} aria-label="Previous image">←</button>
          <button className="boat-lightbox-arrow boat-lightbox-next" type="button" onClick={() => goToImage(1)} aria-label="Next image">→</button>
        </div>
      )}
    </div>
  );
}