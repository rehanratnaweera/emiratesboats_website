import type { ReactNode } from "react";
import { useI18n } from "../i18n";
import { homeHref } from "../router";

interface PageHeroProps {
  /** Home section the page belongs to, for the breadcrumb. */
  parent: { id: string; label: string };
  current: string;
  kicker: string;
  title: ReactNode;
  lede?: string;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}

/** Opening band for the in-depth service pages: breadcrumb, title, and an optional photograph. */
export default function PageHero({ parent, current, kicker, title, lede, image, imageAlt = "", children }: PageHeroProps) {
  const { t } = useI18n();
  return (
    <section className={`page-hero theme-dark${image ? " has-image" : ""}`}>
      <div className="wrap page-hero-layout">
        <div className="page-hero-copy">
          <nav className="crumbs" aria-label={t("Breadcrumb")}>
            <a href={homeHref(parent.id)}>{parent.label}</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{current}</span>
          </nav>
          <p className="eyebrow">{kicker}</p>
          <h1 className="display-1">{title}</h1>
          {lede && <p className="lede">{lede}</p>}
          {children}
        </div>
        {image && (
          <div className="page-hero-media">
            <img src={image} alt={imageAlt} decoding="async" />
          </div>
        )}
      </div>
    </section>
  );
}
