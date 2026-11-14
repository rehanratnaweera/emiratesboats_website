import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { fetchBoats, SITE_MEDIA } from "./cms";
import { EnquiryProvider, GENERAL_INTEREST, useEnquiry } from "./components/Enquiry";
import SiteFooter from "./components/SiteFooter";
import SiteNav from "./components/SiteNav";
import { SERVICE_PAGES } from "./content/services";
import HomePage, { type FleetState } from "./pages/HomePage";
import HydraulicsPage from "./pages/HydraulicsPage";
import ModelPage from "./pages/ModelPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaintingPage from "./pages/PaintingPage";
import ToolingPage from "./pages/ToolingPage";
import { routeKey, scrollToSection, takeArrival, useRoute, type Route } from "./router";
import { useScrollReveal } from "./useScrollReveal";

const NAV_SECTIONS = [
  { id: "fleet", label: "Fleet" },
  { id: "services", label: "Services" },
  { id: "craft", label: "Craft" },
];

/** The title written into index.html at build time; used for the home page. */
const HOME_TITLE = document.title;

function useFleet(): FleetState {
  const [fleet, setFleet] = useState<FleetState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetchBoats(controller.signal)
      .then((boats) => setFleet({ status: "ready", boats }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Could not load the fleet from the CMS", error);
        setFleet({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  return fleet;
}

/**
 * Scroll position per page: a new page opens at the top (or at the section its
 * link named), and the browser's back button returns to where the visitor was.
 */
function useRouteScroll(key: string, fleetStatus: FleetState["status"]) {
  const positions = useRef(new Map<string, number>());
  const currentKey = useRef(key);
  const arrivedAt = useRef<string | null>(null);
  /** Section still to be reached once late content above it has finished loading. */
  const anchor = useRef("");

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    const remember = () => positions.current.set(currentKey.current, window.scrollY);
    const release = () => (anchor.current = "");
    window.addEventListener("scroll", remember, { passive: true });
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.removeEventListener("scroll", remember);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, []);

  useLayoutEffect(() => {
    // Effects run twice under StrictMode in development; arrive only once per page.
    if (arrivedAt.current === key) return;
    arrivedAt.current = key;
    currentKey.current = key;
    const { hash, fromHistory } = takeArrival();
    anchor.current = hash;
    if (hash && scrollToSection(hash, "auto")) return;
    window.scrollTo({ top: fromHistory ? (positions.current.get(key) ?? 0) : 0, behavior: "auto" });
  }, [key]);

  // The fleet loads after first paint and pushes later sections down.
  useEffect(() => {
    if (fleetStatus === "loading" || !anchor.current) return;
    scrollToSection(anchor.current, "auto");
    anchor.current = "";
  }, [fleetStatus]);
}

function Page({ route, fleet }: { route: Route; fleet: FleetState }) {
  const boats = fleet.status === "ready" ? fleet.boats : [];
  if (route.page === "home") return <HomePage fleet={fleet} />;
  if (route.page === "model") return <ModelPage slug={route.slug} fleet={fleet} />;
  if (route.slug === "painting") return <PaintingPage boats={boats} />;
  if (route.slug === "tooling") return <ToolingPage boats={boats} />;
  if (route.slug === "hydraulics") return <HydraulicsPage boats={boats} />;
  return <NotFoundPage title="We couldn't find that page." copy="The service you are looking for may have moved. Everything we do is listed on the home page." />;
}

function Site() {
  const route = useRoute();
  const fleet = useFleet();
  const key = routeKey(route);
  const { setInterest, setMessage } = useEnquiry();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useScrollReveal();
  useRouteScroll(key, fleet.status);

  const boats = fleet.status === "ready" ? fleet.boats : [];
  const boat = route.page === "model" ? boats.find((candidate) => candidate.slug === route.slug) : undefined;
  const servicePage = route.page === "service" ? SERVICE_PAGES[route.slug] : undefined;
  const subject = boat?.name ?? servicePage?.interest ?? GENERAL_INTEREST;
  const title = boat ? [boat.name, boat.tagline].filter(Boolean).join(" — ") : servicePage?.title;

  useEffect(() => {
    document.title = title ? `${title} | Emirates Boats` : HOME_TITLE;
  }, [title]);

  // Each page starts a fresh enquiry about its own subject.
  useEffect(() => {
    setInterest(subject);
    setMessage("");
  }, [key, subject, setInterest, setMessage]);

  // Hand keyboard and screen-reader focus to the new page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [key]);

  return (
    <div className="site">
      <SiteNav logoUrl={SITE_MEDIA.logo} sections={NAV_SECTIONS} onHome={route.page === "home"} overHero />
      <main key={key} ref={mainRef} className="page" tabIndex={-1}>
        <Page route={route} fleet={fleet} />
      </main>
      <SiteFooter boats={boats} logoUrl={SITE_MEDIA.logo} />
    </div>
  );
}

export default function App() {
  return (
    <EnquiryProvider>
      <Site />
    </EnquiryProvider>
  );
}
