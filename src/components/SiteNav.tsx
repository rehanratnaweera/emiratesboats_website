import { useEffect, useRef, useState } from "react";
import { COMPANY } from "../content/site";
import { LANGUAGES, setLanguage, useI18n } from "../i18n";
import { homeHref } from "../router";

interface NavSection {
  id: string;
  label: string;
}

interface SiteNavProps {
  logoUrl: string;
  sections: NavSection[];
  /** True on the home page, where the sections live and can be tracked while scrolling. */
  onHome: boolean;
  /** Over a dark full-bleed hero the bar starts transparent; elsewhere it starts solid. */
  overHero: boolean;
}

const SCROLLED_AFTER = 40;
const HIDE_AFTER = 320;
const SCROLL_DELTA = 6;

/** Tracks scroll position: whether the page has left the top, and whether the bar should hide (scrolling down). */
function useScrollState(locked: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > SCROLLED_AFTER);
      if (y < HIDE_AFTER) setHidden(false);
      else if (y > lastY.current + SCROLL_DELTA) setHidden(true);
      else if (y < lastY.current - SCROLL_DELTA) setHidden(false);
      if (Math.abs(y - lastY.current) > SCROLL_DELTA) lastY.current = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { scrolled, hidden: hidden && !locked };
}

/** Id of the section currently crossing the middle of the viewport. */
function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  const key = enabled ? ids.join("|") : "";

  useEffect(() => {
    setActive(null);
    if (!key || !("IntersectionObserver" in window)) return;
    const elements = key.split("|").map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)));
        setActive(elements.find((el) => visible.has(el.id))?.id ?? null);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/** Language picker. Shows each language by its own name; English is the source and the fallback. */
function LanguageSelect() {
  const { language, t } = useI18n();
  if (LANGUAGES.length < 2) return null;

  return (
    <label className="language-select">
      <span className="sr-only">{t("Language")}</span>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <select value={language.code} onChange={(event) => setLanguage(event.target.value)}>
        {LANGUAGES.map((option) => (
          <option key={option.code} value={option.code} lang={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SiteNav({ logoUrl, sections, onHome, overHero }: SiteNavProps) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrolled, hidden } = useScrollState(menuOpen);
  const active = useActiveSection(sections.map((section) => section.id), onHome);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    const closeOnDesktop = window.matchMedia("(min-width: 900px)");
    const onBreakpoint = () => closeOnDesktop.matches && setMenuOpen(false);
    document.addEventListener("keydown", onKeyDown);
    closeOnDesktop.addEventListener("change", onBreakpoint);
    document.body.style.overflow = "hidden";
    firstMenuLinkRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      closeOnDesktop.removeEventListener("change", onBreakpoint);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Navigation itself is handled by the router's link interception.
  const closeMenu = () => setMenuOpen(false);
  const state = [(scrolled || !overHero) && "is-solid", hidden && "is-hidden", menuOpen && "is-menu-open"].filter(Boolean).join(" ");

  return (
    <header className={`site-nav ${state}`}>
      <div className="site-nav-bar">
        <a className="site-nav-logo" href={homeHref()} onClick={closeMenu} aria-label={t("Emirates Boats — home")}>
          <img src={logoUrl} alt="Emirates Boats" width={740} height={339} />
        </a>

        <nav className="site-nav-links" aria-label={t("Primary")}>
          {sections.map((section) => (
            <a
              key={section.id}
              href={homeHref(section.id)}
              className={`site-nav-link${active === section.id ? " is-active" : ""}`}
              aria-current={active === section.id ? "location" : undefined}
            >
              {t(section.label)}
            </a>
          ))}
        </nav>

        <LanguageSelect />

        <a className="site-nav-cta" href="#contact">
          {t("Enquire")}
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="site-nav-toggle"
          aria-label={menuOpen ? t("Close menu") : t("Open menu")}
          aria-expanded={menuOpen}
          aria-controls="site-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="site-mobile-menu" className="site-mobile-menu" inert={!menuOpen}>
        <nav aria-label={t("Mobile")}>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id} style={{ transitionDelay: menuOpen ? `${120 + index * 70}ms` : "0ms" }}>
                <a ref={index === 0 ? firstMenuLinkRef : undefined} href={homeHref(section.id)} onClick={closeMenu}>
                  <span className="site-mobile-index">{String(index + 1).padStart(2, "0")}</span>
                  {t(section.label)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="site-mobile-footer">
          <a className="btn btn-gold" href="#contact" onClick={closeMenu}>
            {t("Enquire")}
          </a>
          <p>
            {t("{yard}, Dubai, UAE", { yard: COMPANY.yard })}
            <br />
            <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
          </p>
        </div>
      </div>
    </header>
  );
}
