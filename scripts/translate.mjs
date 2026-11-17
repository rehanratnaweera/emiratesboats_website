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

// GEMINI_API_KEY (and optionally GEMINI_MODEL) come from .env, which is not committed.
// A variable already set in the shell wins over the file.
try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
  // No .env: only --check works without a key.
}
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

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

const RETRY_STATUSES = new Set([429, 500, 503]);
const RETRIES = 5;

/** Retries overload, rate-limit and server errors, waiting 5 s, 10 s, 20 s… between attempts. */
async function withRetry(request) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof ApiError) || !RETRY_STATUSES.has(error.status) || attempt >= RETRIES) throw error;
      const seconds = 5 * 2 ** attempt;
      console.warn(`  Gemini returned ${error.status}; retrying in ${seconds} s (${attempt + 1} of ${RETRIES})…`);
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }
  }
}

async function translateBatch(client, language, batch) {
  const response = await withRetry(() => client.models.generateContent({
    model: MODEL,
    contents: `Translate into ${language.name} (language code "${language.code}").\n\n${JSON.stringify(batch.map((text, id) => ({ id, text })))}`,
    config: {
      systemInstruction: SYSTEM,
      maxOutputTokens: 32000,
      responseMimeType: "application/json",
      responseJsonSchema: SCHEMA,
    },
  }));

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
  return result;
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
  let client;

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
      client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log(`${language.name}: translating ${missing.length} strings with ${MODEL}…`);
      for (let start = 0; start < missing.length; start += BATCH_SIZE) {
        const batch = missing.slice(start, start + BATCH_SIZE);
        const result = await translateBatch(client, language, batch);
        result.forEach((translation, english) => (translations[english] = translation));
        // Saved after every batch, so a quota error part-way loses nothing already translated.
        writeLocale(language.code, sources, translations);
        console.log(`  ${Math.min(start + BATCH_SIZE, missing.length)} / ${missing.length}`);
      }
    }
    writeLocale(language.code, sources, translations);
    const stillMissing = sources.filter((english) => !translations[english]).length;
    console.log(`${language.name}: ${sources.length - stillMissing} translated, ${stillMissing} missing, ${unused.length} unused removed.`);
    missingTotal = missingTotal - missing.length + stillMissing;
  }

  if (missingTotal > 0 && (strict || !checkOnly)) process.exitCode = 1;
}

main().catch((error) => {
  if (error instanceof ApiError && (error.status === 400 || error.status === 401 || error.status === 403) && /key/i.test(error.message)) {
    console.error("The Gemini API rejected the key. Check GEMINI_API_KEY in .env and try again.");
  } else if (error instanceof ApiError && error.status === 404) {
    console.error(`Gemini has no model "${MODEL}". Set GEMINI_MODEL in .env to a current model ID.`);
  } else if (error instanceof ApiError && error.status === 429) {
    console.error("Gemini rate limit or quota reached. Wait a minute and run again; finished batches are already saved.");
  } else if (error instanceof ApiError) {
    console.error(`Translation failed (${error.status}): ${error.message}`);
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
});
