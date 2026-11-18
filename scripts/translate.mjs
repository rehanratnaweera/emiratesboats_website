#!/usr/bin/env node
/**
 * Build-time machine translation.
 *
 * English is the only language anyone writes. This script:
 *   1. collects every English string the site can show: the first argument of
 *      t(), rich() and msg() calls in src/, plus the site title from .eb/make/site.json;
 *   2. for each language in src/i18n/languages.json, translates the strings that
 *      src/i18n/locales/<code>.json does not have yet, using Gemini;
 *   3. drops translations of English text the site no longer uses.
 *
 * Translations are committed. Existing entries are never re-translated while
 * their English text is unchanged, so a hand-corrected translation stays.
 *
 *   pnpm translate            translate new or changed text (needs GEMINI_API_KEY in .env)
 *   pnpm translate --check    report untranslated text without calling the API
 *   pnpm translate --check --strict   same, but exit 1 when anything is missing
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiError, FinishReason, GoogleGenAI } from "@google/genai";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const LOCALES = path.join(SRC, "i18n", "locales");
const MARKERS = new Set(["t", "rich", "msg"]);
const BATCH_SIZE = 60;

// GEMINI_API_KEY (and optionally GEMINI_MODELS) come from .env, which is not committed.
// A variable already set in the shell wins over the file.
try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
  // No .env: only --check works without a key.
}

/**
 * Free-tier limits per model, from Google AI Studio → Rate limits: requests per
 * minute and per day. Update them here if Google changes them; a model not listed
 * is treated as 5 per minute, 20 per day.
 */
const MODEL_LIMITS = {
  "gemini-4-hydrogen": { rpm: 5, rpd: 20 },
  "gemini-3.8-flash": { rpm: 5, rpd: 20 },
  "gemini-3.6-flash": { rpm: 5, rpd: 20 },
  "gemini-3.5-flash-lite": { rpm: 15, rpd: 500 },
};
/** Models in order of preference. A batch goes to the first one with quota left. */
const MODELS = (process.env.GEMINI_MODELS || "gemini-4-hydrogen,gemini-3.8-flash,gemini-3.6-flash")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
/** Requests sent today per model, kept between runs because the daily limit is. */
const USAGE_FILE = path.join(ROOT, ".cache", "gemini-usage.json");
/** A model that reports it is overloaded is left alone this long before it is tried again. */
const OVERLOAD_PAUSE_MS = 2 * 60_000;
/** After this many overload errors in a row, a model is dropped for the rest of the run. */
const OVERLOAD_STRIKES = 3;

const args = new Set(process.argv.slice(2));
const checkOnly = args.has("--check");
const strict = args.has("--strict");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const relative = (file) => path.relative(ROOT, file);

/* ── 1. Collect the English source text ─────────────────────────────── */

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts") ? [full] : [];
  });
}

function collectStrings() {
  const strings = new Map();
  const problems = [];

  for (const file of sourceFiles(SRC)) {
    const text = fs.readFileSync(file, "utf8");
    const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);

    const visit = (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && MARKERS.has(node.expression.text)) {
        const [first] = node.arguments;
        const where = `${relative(file)}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
        if (first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))) {
          if (!strings.has(first.text)) strings.set(first.text, where);
        } else if (first && ts.isTemplateExpression(first)) {
          problems.push(`${where}: ${node.expression.text}() was given a template literal; use t("… {name} …", { name }) instead.`);
        }
        // Any other argument is a value marked with msg() where it was defined.
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }

  const siteTitle = readJson(path.join(ROOT, ".eb", "make", "site.json")).title;
  if (siteTitle && !strings.has(siteTitle)) strings.set(siteTitle, ".eb/make/site.json");

  return { strings, problems };
}

/* ── 2. Translate ───────────────────────────────────────────────────── */

/** Placeholders, tags and line breaks a translation must carry over unchanged. */
function tokens(text) {
  return [...(text.match(/\{\w+\}|<\/?\w+>/g) ?? []), ...Array(text.split("\n").length - 1).fill("\\n")].sort().join(" ");
}

const SYSTEM = `You translate the website of Emirates Boats LLC, a Dubai builder of high-performance center console boats and offshore catamarans that also runs a marine service yard (painting, 5-axis CNC tooling, hydraulic swim platforms, repair).

Write natural, polished copy for prospective yacht owners, as a professional marketing translator would, not a word-for-word rendering. Short strings are interface labels (navigation, buttons, form fields, headings): keep them about as short as the English.

Keep exactly as written, in Latin script:
- brand, product and model names: Emirates Boats, Emirates Boats LLC, Cromax®, Axalta, EB-63, EB 63, EB46, EB 46, EB63, EB Cat 80, Mercury, Belotti, H+B technics, Besenzoni, Opacmare, ASCENDER, C-Zone, SeaDeck, Sea Deck, LP 100 Plus;
- standards and abbreviations: RAL, Pantone, CAD, CNC, BOQ, FEA, CFD, MFD, AIS, VHF, RGB, CCTV, UV, 316L;
- numbers, measurements and units, with Western digits (0-9);
- placeholders in braces such as {name} or {count}, character for character;
- tags such as <link>…</link>: keep the tags and their names, translate only the text between them;
- line breaks (\\n), and the ® and © signs.

You will receive a JSON array of {id, text}. Return a translation for every id.`;

const SCHEMA = {
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "integer" }, text: { type: "string" } },
        required: ["id", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["translations"],
  additionalProperties: false,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const seconds = (ms) => `${Math.ceil(ms / 1000)} s`;

/** Free-tier daily quotas reset at midnight Pacific time. */
function quotaDay(now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
}

/** Thrown when every model is out of requests for today. */
class QuotaExhausted extends Error {}

/** The error body Gemini sends with a failed request, if it parses. */
function errorBody(error) {
  try {
    return JSON.parse(error.message).error ?? {};
  } catch {
    return {};
  }
}

/**
 * Sends each request to the most preferred model that still has quota, keeping
 * every model within its requests per minute and per day. Rate-limited and
 * overloaded models are skipped in favor of the next one rather than retried
 * in place, because on the free tier a failed request still counts.
 */
class ModelPool {
  constructor(client, models) {
    this.client = client;
    this.models = models;
    this.pausedUntil = new Map();
    this.strikes = new Map();
    this.usage = { day: quotaDay(), models: {} };
    try {
      const saved = readJson(USAGE_FILE);
      if (saved.day === this.usage.day) this.usage = saved;
    } catch {
      // No usage recorded yet today.
    }
  }

  state(model) {
    this.usage.models[model] ??= { requests: 0, recent: [], exhausted: false };
    return this.usage.models[model];
  }

  limits(model) {
    return MODEL_LIMITS[model] ?? { rpm: 5, rpd: 20 };
  }

  save() {
    fs.mkdirSync(path.dirname(USAGE_FILE), { recursive: true });
    fs.writeFileSync(USAGE_FILE, `${JSON.stringify(this.usage, null, 2)}\n`);
  }

  /** Milliseconds until the model may take a request; Infinity when it is done for today or this run. */
  waitFor(model, now) {
    const state = this.state(model);
    const { rpm, rpd } = this.limits(model);
    if (state.exhausted || state.requests >= rpd) return Infinity;
    state.recent = state.recent.filter((time) => now - time < 60_000);
    let wait = Math.max(0, (this.pausedUntil.get(model) ?? 0) - now);
    if (state.recent.length >= rpm) wait = Math.max(wait, state.recent[0] + 60_000 - now);
    return wait;
  }

  async generate(request) {
    for (;;) {
      if (this.quotaDayChanged()) continue;
      const now = Date.now();
      const options = this.models.map((model) => ({ model, wait: this.waitFor(model, now) })).filter((option) => option.wait !== Infinity);
      if (!options.length) throw new QuotaExhausted(this.outOfModels());
      const choice = options.find((option) => option.wait === 0) ?? options.reduce((a, b) => (b.wait < a.wait ? b : a));
      if (choice.wait > 0) {
        const paused = (this.pausedUntil.get(choice.model) ?? 0) - now >= choice.wait;
        console.log(`  waiting ${seconds(choice.wait)} for ${choice.model} (${paused ? "paused after an error" : "per-minute limit"})…`);
        await sleep(choice.wait);
        continue;
      }

      const { model } = choice;
      const state = this.state(model);
      state.requests += 1;
      state.recent.push(Date.now());
      this.save();
      try {
        const response = await this.client.models.generateContent({ ...request, model });
        this.strikes.delete(model);
        return { model, response };
      } catch (error) {
        if (!this.skip(model, error)) throw error;
      }
    }
  }

  /** A run that crosses midnight Pacific time starts the day's counts again. */
  quotaDayChanged() {
    if (this.usage.day === quotaDay()) return false;
    this.usage = { day: quotaDay(), models: {} };
    return true;
  }

  /** Records why a model failed and decides whether another model can take the request. */
  skip(model, error) {
    if (!(error instanceof ApiError)) return false;
    const body = errorBody(error);
    const reason = body.message?.split("\n")[0] ?? error.message;

    if (error.status === 429) {
      const violations = (body.details ?? []).flatMap((detail) => detail.violations ?? []);
      if (violations.some((violation) => /PerDay/i.test(violation.quotaId ?? ""))) {
        this.state(model).exhausted = true;
        this.save();
        console.warn(`  ${model} is out of free requests for today; moving on.`);
      } else {
        const delay = (body.details ?? []).find((detail) => detail.retryDelay)?.retryDelay;
        const wait = delay ? parseFloat(delay) * 1000 : 60_000;
        this.pausedUntil.set(model, Date.now() + wait);
        console.warn(`  ${model} hit its per-minute limit; pausing it for ${seconds(wait)}.`);
      }
      return true;
    }
    if (error.status === 500 || error.status === 503) {
      const strikes = (this.strikes.get(model) ?? 0) + 1;
      this.strikes.set(model, strikes);
      const dropped = strikes >= OVERLOAD_STRIKES;
      this.pausedUntil.set(model, dropped ? Infinity : Date.now() + OVERLOAD_PAUSE_MS);
      console.warn(`  ${model} is unavailable (${error.status}: ${reason}); ${dropped ? "dropping it for this run" : `trying another model, back to it in ${seconds(OVERLOAD_PAUSE_MS)}`}.`);
      return true;
    }
    if (error.status === 404) {
      this.pausedUntil.set(model, Infinity);
      console.warn(`  Gemini has no model "${model}"; check GEMINI_MODELS in .env. Using the others.`);
      return true;
    }
    return false;
  }

  /** Why no model is left: out of today's requests, or dropped for this run after errors. */
  outOfModels() {
    const spent = this.models.filter((model) => this.state(model).exhausted || this.state(model).requests >= this.limits(model).rpd);
    const failing = this.models.filter((model) => !spent.includes(model));
    const lines = ["No model is left to translate with; finished batches are saved."];
    if (spent.length) lines.push(`  Out of free requests until midnight Pacific time: ${spent.join(", ")}.`);
    if (failing.length) lines.push(`  Kept failing (overloaded or not found) and still have requests today: ${failing.join(", ")}.`);
    lines.push(failing.length ? 'Run "pnpm translate" again in a few minutes.' : 'Run "pnpm translate" again after midnight Pacific time.');
    return lines.join("\n");
  }

  /** Today's requests per model, for the summary line. */
  summary() {
    return this.models.map((model) => `${model} ${this.state(model).requests}/${this.limits(model).rpd}`).join(", ");
  }
}

async function translateBatch(pool, language, batch) {
  const { model, response } = await pool.generate({
    contents: `Translate into ${language.name} (language code "${language.code}").\n\n${JSON.stringify(batch.map((text, id) => ({ id, text })))}`,
    config: {
      systemInstruction: SYSTEM,
      maxOutputTokens: 32000,
      responseMimeType: "application/json",
      responseJsonSchema: SCHEMA,
    },
  });

  const blocked = response.promptFeedback?.blockReason;
  if (blocked) throw new Error(`Gemini blocked the request (${blocked}).`);
  const finish = response.candidates?.[0]?.finishReason;
  if (finish === FinishReason.MAX_TOKENS) throw new Error("The response was cut off; lower BATCH_SIZE.");
  if (finish && finish !== FinishReason.STOP) throw new Error(`Gemini stopped early (${finish}).`);
  const text = response.text;
  if (!text) throw new Error("The response had no text.");

  const result = new Map();
  for (const { id, text: translation } of JSON.parse(text).translations) {
    const english = batch[id];
    if (english === undefined || !translation.trim()) continue;
    if (tokens(english) !== tokens(translation)) {
      console.warn(`  ! skipped, placeholders or tags changed: ${JSON.stringify(english)} -> ${JSON.stringify(translation)}`);
      continue;
    }
    result.set(english, translation);
  }
  return { model, result };
}

/* ── 3. Write the locale files ──────────────────────────────────────── */

function localeFile(code) {
  return path.join(LOCALES, `${code}.json`);
}

function readLocale(code) {
  const file = localeFile(code);
  return fs.existsSync(file) ? readJson(file) : {};
}

function writeLocale(code, sources, translations) {
  // English source order keeps the diffs of a re-run small and readable.
  const ordered = {};
  for (const english of sources) if (translations[english]) ordered[english] = translations[english];
  fs.mkdirSync(LOCALES, { recursive: true });
  fs.writeFileSync(localeFile(code), `${JSON.stringify(ordered, null, 2)}\n`);
}

async function main() {
  const { strings, problems } = collectStrings();
  problems.forEach((problem) => console.warn(`! ${problem}`));
  const sources = [...strings.keys()];
  const targets = readJson(path.join(SRC, "i18n", "languages.json")).slice(1);
  let missingTotal = 0;
  let pool;

  for (const language of targets) {
    const existing = readLocale(language.code);
    const missing = sources.filter((english) => !existing[english]);
    const unused = Object.keys(existing).filter((english) => !strings.has(english));
    missingTotal += missing.length;

    if (checkOnly) {
      if (missing.length) {
        console.warn(`${language.name}: ${missing.length} of ${sources.length} strings have no translation yet and will show in English. Run "pnpm translate".`);
        missing.slice(0, 10).forEach((english) => console.warn(`  - ${JSON.stringify(english)} (${strings.get(english)})`));
        if (missing.length > 10) console.warn(`  … and ${missing.length - 10} more`);
      } else {
        console.log(`${language.name}: all ${sources.length} strings translated.`);
      }
      continue;
    }

    const translations = { ...existing };
    if (missing.length) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set. Add it to .env (see .env.example) and run again.");
      }
      pool ??= new ModelPool(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), MODELS);
      console.log(`${language.name}: translating ${missing.length} strings. Requests today: ${pool.summary()}.`);
      for (let start = 0; start < missing.length; start += BATCH_SIZE) {
        const batch = missing.slice(start, start + BATCH_SIZE);
        const { model, result } = await translateBatch(pool, language, batch);
        result.forEach((translation, english) => (translations[english] = translation));
        // Saved after every batch, so a quota error part-way loses nothing already translated.
        writeLocale(language.code, sources, translations);
        console.log(`  ${Math.min(start + BATCH_SIZE, missing.length)} / ${missing.length} (${model})`);
      }
    }
    writeLocale(language.code, sources, translations);
    const stillMissing = sources.filter((english) => !translations[english]).length;
    console.log(`${language.name}: ${sources.length - stillMissing} translated, ${stillMissing} missing, ${unused.length} unused removed.`);
    missingTotal = missingTotal - missing.length + stillMissing;
  }

  if (pool) console.log(`Requests today: ${pool.summary()}.`);
  if (missingTotal > 0 && (strict || !checkOnly)) process.exitCode = 1;
}

main().catch((error) => {
  if (error instanceof QuotaExhausted) {
    console.error(error.message);
  } else if (error instanceof ApiError && (error.status === 400 || error.status === 401 || error.status === 403) && /key/i.test(error.message)) {
    console.error("The Gemini API rejected the key. Check GEMINI_API_KEY in .env and try again.");
  } else if (error instanceof ApiError) {
    console.error(`Translation failed (${error.status}): ${error.message}`);
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
});
