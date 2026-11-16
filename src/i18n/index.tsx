/**
 * Site translation. English is the source language: every string is written in
 * English in the code and doubles as its own translation key. Other languages are
 * machine-translated at build time by scripts/translate.mjs into src/i18n/locales/.
 *
 * - `t("Text with {name}", { name })` translates text written in a component.
 * - `msg("Text")` marks text that lives in a data module (src/content/…) so the
 *   translation script finds it; render it with `t(value)`.
 * - Any string without a translation (CMS content, a new sentence not yet
 *   translated) is shown in English.
 */
import { Fragment, useSyncExternalStore, type ReactNode } from "react";
import LANGUAGE_LIST from "./languages.json";

export interface Language {
  code: string;
  /** Name in the language itself, as shown in the selector. */
  name: string;
  dir: "ltr" | "rtl";
}

type Dictionary = Record<string, string>;
type Vars = Record<string, string | number>;
type TagRenderers = Record<string, (content: string) => ReactNode>;

export const LANGUAGES = LANGUAGE_LIST as Language[];
const SOURCE = LANGUAGES[0];
const STORAGE_KEY = "eb-language";

const locales = import.meta.glob<Dictionary>("./locales/*.json", { import: "default" });

/** Marks text in a data module for translation. Returns the English text unchanged. */
export function msg(source: string) {
  return source;
}

function interpolate(text: string, vars?: Vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

const TAG = /<(\w+)>([\s\S]*?)<\/\1>/g;

function createSnapshot(language: Language, dictionary: Dictionary) {
  const t = (source: string, vars?: Vars) => interpolate(dictionary[source] || source, vars);

  /** Like `t`, but `<name>…</name>` tags in the text are rendered by the matching function. */
  const rich = (source: string, tags: TagRenderers, vars?: Vars): ReactNode => {
    const text = t(source, vars);
    const parts: ReactNode[] = [];
    let last = 0;
    for (const match of text.matchAll(TAG)) {
      const index = match.index ?? 0;
      if (index > last) parts.push(text.slice(last, index));
      const render = tags[match[1]];
      parts.push(<Fragment key={index}>{render ? render(match[2]) : match[2]}</Fragment>);
      last = index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  return { language, t, rich };
}

export type I18n = ReturnType<typeof createSnapshot>;

let snapshot = createSnapshot(SOURCE, {});
let pending = 0;
const listeners = new Set<() => void>();

function findLanguage(code: string | null | undefined) {
  return code ? LANGUAGES.find((language) => language.code === code.toLowerCase()) : undefined;
}

function savedLanguage() {
  try {
    return findLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

/** The visitor's saved choice, else the first browser language we support, else English. */
function detectLanguage() {
  const saved = savedLanguage();
  if (saved) return saved;
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const match = findLanguage(tag?.split("-")[0]);
    if (match) return match;
  }
  return SOURCE;
}

async function loadDictionary(language: Language): Promise<Dictionary> {
  if (language.code === SOURCE.code) return {};
  const load = locales[`./locales/${language.code}.json`];
  if (!load) return {};
  try {
    return await load();
  } catch (error) {
    console.error(`Could not load the ${language.name} translation`, error);
    return {};
  }
}

async function apply(language: Language) {
  const request = ++pending;
  const dictionary = await loadDictionary(language);
  // A later choice wins if the visitor switches again while this one loads.
  if (request !== pending) return;
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.dir;
  snapshot = createSnapshot(language, dictionary);
  listeners.forEach((listener) => listener());
}

/** Picks and loads the starting language. Await before the first render so the page never flashes English. */
export function initLanguage() {
  return apply(detectLanguage());
}

export function setLanguage(code: string) {
  const language = findLanguage(code);
  if (!language || language.code === snapshot.language.code) return;
  try {
    localStorage.setItem(STORAGE_KEY, language.code);
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
  void apply(language);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current language and its translate functions; re-renders the component when the language changes. */
export function useI18n(): I18n {
  return useSyncExternalStore(subscribe, () => snapshot);
}

/** Renders line breaks ("\n") in a translated string as <br />. */
export function withBreaks(text: string): ReactNode {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}
