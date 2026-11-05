import { useEffect, useRef } from "react";

interface HeroVideoProps {
  src: string;
  poster: string;
  /** Seconds. The source is a 76s promo; only the bright action segment is looped. */
  loopStart: number;
  loopEnd: number;
}

/**
 * Background video that loops a segment of the source file instead of the whole
 * thing (skipping its title cards). Respects prefers-reduced-motion by staying
 * on the poster frame.
 */
export default function HeroVideo({ src, poster, loopStart, loopEnd }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const restart = () => {
      video.currentTime = loopStart;
    };
    const keepInSegment = () => {
      if (video.currentTime >= loopEnd || video.currentTime < loopStart - 0.5) restart();
    };
    const onEnded = () => {
      restart();
      void video.play().catch(() => undefined);
    };
    const syncPlayback = () => {
      if (reducedMotion.matches) video.pause();
      else void video.play().catch(() => undefined);
    };

    video.addEventListener("timeupdate", keepInSegment);
    video.addEventListener("ended", onEnded);
    reducedMotion.addEventListener("change", syncPlayback);
    syncPlayback();

    return () => {
      video.removeEventListener("timeupdate", keepInSegment);
      video.removeEventListener("ended", onEnded);
      reducedMotion.removeEventListener("change", syncPlayback);
    };
  }, [loopStart, loopEnd]);

  return (
    <video
      ref={videoRef}
      className="hero-video absolute inset-0 h-full w-full object-cover"
      src={`${src}#t=${loopStart}`}
      poster={poster}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
