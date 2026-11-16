import { useCallback, useEffect, useRef, useState } from "react";
import type { BoatImage } from "../cms";
import { useI18n } from "../i18n";

interface LightboxProps {
  images: BoatImage[];
  index: number;
  label: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_DISTANCE = 48;

/** Full-screen photograph viewer with captions, keyboard and swipe navigation. */
export default function Lightbox({ images, index, label, onIndexChange, onClose }: LightboxProps) {
  const image = images[index];
  const count = images.length;
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const { language, t } = useI18n();
  /** In right-to-left languages "next" sits on the left: arrow keys and swipes follow the layout. */
  const forward = language.dir === "rtl" ? -1 : 1;

  const step = useCallback(
    (delta: number) => onIndexChange((index + delta + count) % count),
    [count, index, onIndexChange],
  );

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") step(forward);
      else if (event.key === "ArrowLeft") step(-forward);
      else if (event.key === "Tab") {
        // Keep focus inside the dialog.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [forward, onClose, step]);

  // Warm the neighbours, but never pull multi-megabyte originals ahead of time.
  useEffect(() => {
    [images[(index + 1) % count], images[(index - 1 + count) % count]].forEach((neighbour) => {
      if (neighbour?.optimised) new Image().src = neighbour.large;
    });
  }, [count, images, index]);

  if (!image) return null;
  const loading = loadedId !== image.id;

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={t("{name} photographs", { name: label })}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <header className="lightbox-bar">
        <p className="lightbox-count" aria-live="polite">
          <span>{String(index + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
        </p>
        <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose}>
          {t("Close")}
        </button>
      </header>

      <div
        className="lightbox-stage"
        onClick={(event) => event.target === event.currentTarget && onClose()}
        onPointerDown={(event) => (swipeStart.current = event.clientX)}
        onPointerUp={(event) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (start === null || count < 2) return;
          const distance = event.clientX - start;
          if (Math.abs(distance) > SWIPE_DISTANCE) step(distance < 0 ? forward : -forward);
        }}
      >
        {loading && (
          <p className="lightbox-loading" role="status">
            <span className="lightbox-spinner" aria-hidden="true" />
            {image.optimised ? t("Loading") : t("Loading full-resolution original")}
          </p>
        )}
        <img
          key={image.id}
          className={`lightbox-image${loading ? " is-loading" : ""}`}
          src={image.large}
          alt={image.alt}
          draggable={false}
          onLoad={() => setLoadedId(image.id)}
          onError={() => setLoadedId(image.id)}
        />
      </div>

      <footer className="lightbox-footer">
        <button type="button" className="lightbox-arrow" onClick={() => step(-1)} aria-label={t("Previous photograph")} disabled={count < 2}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="lightbox-caption">
          {image.title && <p className="lightbox-caption-title">{image.title}</p>}
          {image.description && <p className="lightbox-caption-copy">{image.description}</p>}
          {!image.title && !image.description && <p className="lightbox-caption-copy">{label}</p>}
        </div>
        <button type="button" className="lightbox-arrow" onClick={() => step(1)} aria-label={t("Next photograph")} disabled={count < 2}>
          <span aria-hidden="true">→</span>
        </button>
      </footer>
    </div>
  );
}
