/**
 * Deterministic evidence guards.
 *
 * Gemini is instructed to use only retrieved evidence, but instructions alone are not a guarantee.
 * These pure functions check the model's claims against the actual retrieved title/snippet/URL text
 * and drop or downgrade anything the evidence does not support. Nothing here knows any scheme.
 */

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function squash(text: string): string {
  return normalizeText(text).replace(/[^a-z0-9%]+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Scheme-name <-> source relevance (source-to-scheme traceability)
// ---------------------------------------------------------------------------

const NAME_STOPWORDS = new Set([
  "scheme", "schemes", "yojana", "programme", "program", "programmes", "programs", "government", "govt",
  "tamil", "nadu", "india", "indian", "central", "state", "national", "department", "directorate", "ministry",
  "the", "for", "and", "with", "under", "from", "into", "of", "to", "in", "on", "at", "by", "or",
  "students", "student", "assistance", "support", "financial", "welfare", "benefit", "benefits", "scheme's",
  "education", "educational", "higher", "collegiate", "technical", "general", "public", "commission", "board",
  "authority", "social", "justice", "empowerment", "corporation", "institute", "institution", "institutions",
]);

function significantNameTokens(name: string): string[] {
  const tokens = new Set<string>();
  for (const raw of name.split(/[^A-Za-z0-9]+/)) {
    if (!raw) continue;
    const lower = raw.toLowerCase();
    const isAcronym = raw.length >= 3 && raw === raw.toUpperCase() && /[A-Z]/.test(raw);
    if (isAcronym || (lower.length >= 4 && !NAME_STOPWORDS.has(lower))) tokens.add(lower);
  }
  return [...tokens];
}

function urlToWords(url: string): string {
  try {
    const u = new URL(url);
    return decodeURIComponent(`${u.hostname} ${u.pathname}`).replace(/[-_./]+/g, " ");
  } catch {
    return url;
  }
}

/**
 * Does this retrieved result plausibly describe THIS scheme? True when at least half (or two) of the
 * scheme name's distinctive words appear in the result's title/snippet/URL. A scheme name written as
 * "A / B" is treated as alternative names. Used to stop "Scheme A cites a page about Scheme B".
 */
export function sourceMatchesScheme(
  schemeName: string,
  source: { title: string; snippet: string; link: string },
): boolean {
  const haystack = squash(`${source.title} ${source.snippet} ${urlToWords(source.link)}`);
  const haystackNoSpaces = haystack.replace(/ /g, "");

  return schemeName.split(/\s\/\s|\s\|\s/).some((alt) => {
    const tokens = significantNameTokens(alt);
    if (tokens.length === 0) return false;
    const present = tokens.filter((t) => haystack.includes(t) || haystackNoSpaces.includes(t)).length;
    return present >= 2 || present / tokens.length >= 0.5;
  });
}

/** True when a quote the model attributes to a source really appears in that source's retrieved text. */
export function quoteAppearsInSource(quote: string, source: { title: string; snippet: string }): boolean {
  const q = squash(quote.replace(/\.{2,}|…/g, " "));
  if (q.length < 15) return false;
  return squash(`${source.title} ${source.snippet}`).includes(q);
}

// ---------------------------------------------------------------------------
// Numeric grounding (amounts, income limits, percentages)
// ---------------------------------------------------------------------------

const UNIT_MULTIPLIER: Record<string, number> = {
  lakh: 1e5, lakhs: 1e5, lac: 1e5, lacs: 1e5, crore: 1e7, crores: 1e7, thousand: 1e3,
};

/** Keys such as "250000" (amounts >= 1000, years excluded) and "60%" for every checkable figure in text. */
export function extractFigures(text: string): Set<string> {
  const keys = new Set<string>();
  const re = /(\d[\d,]*(?:\.\d+)?)\s*(lakhs?|lacs?|crores?|thousand|%|per\s?cent|percent)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const value = parseFloat(m[1].replace(/,/g, ""));
    if (!Number.isFinite(value)) continue;
    const unit = m[2]?.toLowerCase().replace(/\s/g, "");
    if (unit === "%" || unit?.startsWith("per")) {
      keys.add(`${value}%`);
      continue;
    }
    const amount = unit && UNIT_MULTIPLIER[unit] ? value * UNIT_MULTIPLIER[unit] : value;
    const isYear = !unit && Number.isInteger(amount) && amount >= 1900 && amount <= 2100;
    if (amount >= 1000 && !isYear) keys.add(String(Math.round(amount)));
  }
  return keys;
}

export function unsupportedFigures(text: string, evidence: Set<string>, allowed: Set<string> = new Set()): string[] {
  return [...extractFigures(text)].filter((k) => !evidence.has(k) && !allowed.has(k));
}

/**
 * Keeps only the ";"/newline/bullet-separated clauses whose figures all appear in the evidence
 * (or are the citizen's own numbers). Returns "" when nothing survives.
 */
export function keepGroundedClauses(text: string, evidence: Set<string>, allowed: Set<string> = new Set()): string {
  return text
    .split(/\r?\n|;|•/)
    .map((c) => c.trim())
    .filter(Boolean)
    .filter((clause) => unsupportedFigures(clause, evidence, allowed).length === 0)
    .join("; ");
}

// ---------------------------------------------------------------------------
// Deadlines
// ---------------------------------------------------------------------------

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

interface ParsedDate {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseDeadlineDate(text: string): ParsedDate | null {
  const t = text.toLowerCase();
  let m = t.match(/\b(20\d\d)[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (m) return { year: +m[1], month: +m[2], day: +m[3] };

  m = t.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d\d)\b/);
  if (m) return { year: +m[3], month: +m[2], day: +m[1] };

  const monthPattern = MONTHS.join("|");
  m = t.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthPattern})[a-z]*\\.?,?\\s+(20\\d\\d)\\b`));
  if (m) return { year: +m[3], month: MONTHS.indexOf(m[2]) + 1, day: +m[1] };

  m = t.match(new RegExp(`\\b(${monthPattern})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(20\\d\\d)\\b`));
  if (m) return { year: +m[3], month: MONTHS.indexOf(m[1]) + 1, day: +m[2] };

  return null;
}

/**
 * A deadline is shown only if (a) it is not already in the past and (b) the evidence actually
 * contains its date — the year, the day and the month. For a date we cannot parse, most of its
 * distinctive words must appear in the evidence. Returns false (drop it) whenever unsure.
 */
export function isDeadlineSupported(deadline: string, evidenceText: string, now: Date = new Date()): boolean {
  const evidence = normalizeText(evidenceText);
  const d = deadline.toLowerCase();

  const yearMatch = d.match(/\b(20\d\d)\b/);
  if (yearMatch && +yearMatch[1] < now.getFullYear()) return false;

  const parsed = parseDeadlineDate(deadline);
  if (parsed) {
    const endOfDeadline = new Date(parsed.year, parsed.month - 1, parsed.day, 23, 59, 59);
    if (endOfDeadline.getTime() < now.getTime()) return false;

    const hasYear = new RegExp(`\\b${parsed.year}\\b`).test(evidence);
    const hasDay = new RegExp(`(?<!\\d)0?${parsed.day}(?:st|nd|rd|th)?(?!\\d)`).test(evidence);
    const monthName = MONTHS[parsed.month - 1];
    const hasMonth =
      evidence.includes(monthName) ||
      new RegExp(`[-/.]0?${parsed.month}[-/.]`).test(evidence);
    return hasYear && hasDay && hasMonth;
  }

  const words = d.split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
  if (words.length === 0) return false;
  const present = words.filter((w) => evidence.includes(w)).length;
  return present / words.length >= 0.75 && /\d/.test(d) && new RegExp(d.match(/\d+/)![0]).test(evidence);
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

const DOC_STOPWORDS = new Set(["card", "document", "documents", "proof", "copy", "with", "from", "that", "this", "your", "issued", "attested", "self", "valid"]);

/** A required-document entry is kept only if most of its distinctive words appear in the evidence. */
export function isDocumentSupported(doc: string, evidenceText: string): boolean {
  const evidence = squash(evidenceText).replace(/aadhar/g, "aadhaar");
  const words = squash(doc)
    .replace(/aadhar/g, "aadhaar")
    .split(" ")
    .filter((w) => w.length >= 4 && !DOC_STOPWORDS.has(w));
  if (words.length === 0) return false;
  const present = words.filter((w) => evidence.includes(w)).length;
  return present / words.length >= 0.6;
}

// ---------------------------------------------------------------------------
// Application vs information link
// ---------------------------------------------------------------------------

/**
 * "application" only when the URL or the retrieved text of that page indicates it is where you apply
 * (apply / application / registration / login). Everything else is honestly labelled "information".
 */
export function classifyLinkKind(url: string, sourceText: string): "application" | "information" {
  let path = url;
  try {
    const u = new URL(url);
    path = `${u.hostname}${u.pathname}${u.search}`;
  } catch {
    /* keep raw */
  }
  if (/guideline|faq|circular|notification|report|\.pdf($|\?)/i.test(path)) return "information";
  if (/apply|application|register|registration|login|signin|sign-in|enrol|enroll/i.test(path)) return "application";
  if (/\bapply (online|now|here|through|at)\b|online application|application (form|portal)|register (online|here|now)/i.test(sourceText)) {
    return "application";
  }
  return "information";
}
