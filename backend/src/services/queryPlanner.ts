import type { GovLevel, RawSearchResult, UserProfile } from "../types";
import { getStateDomainTokens } from "../utils/stateDomains";

/**
 * Query planning for the retrieval pipeline.
 *
 * Nothing here is scheme data. It only decides (a) which levels of government the citizen asked
 * for, (b) which kinds of benefit they are asking about, and (c) how to phrase and scope live
 * search queries so both levels are searched deliberately — instead of hoping one flat query list
 * happens to cover both.
 */

interface IntentDefinition {
  id: string;
  /** Matches the citizen's own words (question, occupation, education) to this kind of benefit. */
  triggers: RegExp;
  /** Generic search phrasings for this kind of benefit (not scheme names). */
  phrases: string[];
  extraCentralPhrases?: string[];
  extraStatePhrases?: string[];
  /** Words whose presence in a result's title/snippet/URL shows it relates to this intent. */
  keywords: string[];
  /** Official Government-of-India portals relevant to this kind of benefit, for site: scoping. */
  centralPortals: string[];
}

const INTENTS: IntentDefinition[] = [
  {
    id: "education",
    triggers: /scholar|student|college|educat|tuition|universit|undergrad|graduat|hostel|academic|course|study|loan/g,
    phrases: [
      "undergraduate student scholarship",
      "college student financial assistance",
      "higher education scholarship scheme",
      "student welfare scheme",
    ],
    extraCentralPhrases: ["education loan interest subsidy", "central sector scholarship college students"],
    extraStatePhrases: ["first generation graduate scholarship", "education fee concession students"],
    keywords: ["scholarship", "student", "education", "college", "tuition", "fee", "loan", "hostel", "university", "degree"],
    centralPortals: ["scholarships.gov.in", "education.gov.in", "myscheme.gov.in"],
  },
  {
    id: "employment",
    triggers: /\bjobs?\b|employ|skill|train|career|placement|unemployed|internship|apprentice/g,
    phrases: [
      "youth employment scheme",
      "skill training scheme for youth",
      "unemployed youth assistance",
      "apprenticeship internship scheme",
    ],
    keywords: ["employment", "skill", "training", "youth", "job", "apprentice", "internship", "placement"],
    centralPortals: ["msde.gov.in", "myscheme.gov.in", "labour.gov.in"],
  },
  {
    id: "business",
    triggers: /business|entrepreneur|start.?up|self.?employ|msme|enterprise|mudra|small shop|own venture/g,
    phrases: [
      "self employment loan subsidy scheme",
      "young entrepreneur startup support scheme",
      "small business subsidy scheme",
      "micro enterprise financial assistance",
    ],
    keywords: ["entrepreneur", "business", "startup", "self-employment", "self employment", "enterprise", "msme", "subsidy", "loan"],
    centralPortals: ["msme.gov.in", "myscheme.gov.in", "startupindia.gov.in"],
  },
  {
    id: "agriculture",
    triggers: /farm|agricult|crop|kisan|cultivat|irrigat|livestock|dairy/g,
    phrases: ["farmer welfare scheme", "crop insurance subsidy for farmers", "agricultural loan subsidy scheme"],
    keywords: ["farmer", "agricultur", "crop", "kisan", "cultivat", "irrigation", "livestock"],
    centralPortals: ["agriculture.gov.in", "myscheme.gov.in", "pmkisan.gov.in"],
  },
  {
    id: "women",
    triggers: /wom[ae]n|girl|widow|mother|pregnan|self.?help group|\bshg\b/g,
    phrases: ["women welfare scheme", "financial assistance for women", "girl child scheme"],
    keywords: ["women", "woman", "girl", "widow", "mother", "maternity", "self help group"],
    centralPortals: ["wcd.gov.in", "myscheme.gov.in"],
  },
  {
    id: "disability",
    triggers: /disab|differently.?abled|handicap|divyang|\bblind\b|\bdeaf\b|wheelchair/g,
    phrases: ["disability welfare scheme", "financial assistance for persons with disabilities", "disability scholarship"],
    keywords: ["disab", "divyang", "handicap", "differently abled", "pwd"],
    centralPortals: ["disabilityaffairs.gov.in", "myscheme.gov.in"],
  },
  {
    id: "housing",
    triggers: /\bhous(e|ing)\b|\bhome\b|shelter|awas|\brent\b|\bplot\b/g,
    phrases: ["housing scheme for low income families", "financial assistance to build a house", "affordable housing subsidy"],
    keywords: ["housing", "house", "awas", "shelter", "home"],
    centralPortals: ["pmay-urban.gov.in", "pmayg.nic.in", "myscheme.gov.in"],
  },
  {
    id: "pension",
    triggers: /pension|senior citizen|old age|elderly|retire/g,
    phrases: ["old age pension scheme", "senior citizen welfare scheme", "social security pension scheme"],
    keywords: ["pension", "senior citizen", "old age", "elderly", "social security"],
    centralPortals: ["nsap.nic.in", "myscheme.gov.in"],
  },
  {
    id: "health",
    triggers: /health|medical|hospital|insurance|treatment|ayushman|surgery/g,
    phrases: ["health insurance scheme", "medical treatment financial assistance", "free medical treatment scheme"],
    keywords: ["health", "medical", "hospital", "insurance", "treatment", "ayushman"],
    centralPortals: ["pmjay.gov.in", "mohfw.gov.in", "myscheme.gov.in"],
  },
];

const GENERAL_INTENT: IntentDefinition = {
  id: "general",
  triggers: /$^/g,
  phrases: ["welfare scheme for citizens", "government financial assistance scheme", "government benefits for eligible citizens"],
  keywords: [],
  centralPortals: ["myscheme.gov.in", "india.gov.in"],
};

export interface SearchPlan {
  levels: Record<GovLevel, boolean>;
  stateName?: string;
  intents: IntentDefinition[];
  /** Union of intent keywords, used to judge whether a retrieved result relates to the request. */
  relevanceTerms: string[];
}

export interface TaggedQuery {
  query: string;
  level: GovLevel;
}

export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(new RegExp(pattern.source, "g")) ?? []).length;
}

/**
 * Which levels of government did the citizen ask for? Explicit "central" wording without state
 * wording means Central only, and vice versa; otherwise both (when a known state is selected).
 */
function detectLevels(profile: UserProfile, stateName: string | undefined): Record<GovLevel, boolean> {
  const text = (profile.freeText ?? "").toLowerCase();
  const centralMention = /\bcentral\b|\bcentre\b|government of india|union government|\bgoi\b/.test(text);
  const stateNameInText = stateName ? text.includes(stateName.toLowerCase()) : false;
  const explicitStateMention =
    /state government|state govt|state schemes?/.test(text) ||
    (stateName ? new RegExp(`${stateName.toLowerCase()}\\s+(government|govt|schemes?)`).test(text) : false);

  if (!stateName) return { central: true, state: false };
  // Default is BOTH levels. Only narrow when the citizen clearly asked for one level and never
  // mentioned the other ("both ... and" always means both).
  if (/\bboth\b/.test(text)) return { central: true, state: true };
  if (centralMention && !stateNameInText && !explicitStateMention) return { central: true, state: false };
  if (explicitStateMention && !centralMention) return { central: false, state: true };
  return { central: true, state: true };
}

function detectIntents(profile: UserProfile): IntentDefinition[] {
  const text = [profile.freeText, profile.occupation, profile.education].filter(Boolean).join(" ").toLowerCase();

  const scored = INTENTS.map((intent, order) => ({ intent, order, score: countMatches(text, intent.triggers) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 3)
    .map((entry) => entry.intent);

  return scored.length > 0 ? scored : [GENERAL_INTENT];
}

export function buildSearchPlan(profile: UserProfile): SearchPlan {
  const stateName = getStateDomainTokens(profile.state).length > 0 ? profile.state?.trim() : undefined;
  const intents = detectIntents(profile);
  const relevanceTerms = [...new Set(intents.flatMap((intent) => intent.keywords))];
  return { levels: detectLevels(profile, stateName), stateName, intents, relevanceTerms };
}

/** How many of the plan's topic keywords appear in a result's title/snippet/URL (1 when no topic is known). */
export function relevanceScore(result: Pick<RawSearchResult, "title" | "snippet" | "link">, plan: SearchPlan): number {
  if (plan.relevanceTerms.length === 0) return 1;
  const haystack = `${result.title} ${result.snippet} ${result.link}`.toLowerCase();
  return plan.relevanceTerms.filter((term) => haystack.includes(term)).length;
}

interface PhraseCandidate {
  phrase: string;
  intent?: IntentDefinition;
}

/** Interleaves phrases across intents so a multi-topic question gets one query per topic before repeats. */
function templatePhrases(level: GovLevel, plan: SearchPlan): PhraseCandidate[] {
  const lists = plan.intents.map((intent) => {
    const extra = level === "central" ? intent.extraCentralPhrases : intent.extraStatePhrases;
    return [...intent.phrases.slice(0, 2), ...(extra ?? []), ...intent.phrases.slice(2)].map((phrase) => ({
      phrase,
      intent,
    }));
  });

  const merged: PhraseCandidate[] = [];
  const longest = Math.max(...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (list[i]) merged.push(list[i]);
  }
  return merged;
}

function scopeFor(level: GovLevel, plan: SearchPlan, candidate: PhraseCandidate, index: number): string {
  if (level === "state") {
    const token = getStateDomainTokens(plan.stateName)[0];
    return token ? `site:${token}` : "site:gov.in";
  }
  const scopes = candidate.intent
    ? ["site:gov.in", ...candidate.intent.centralPortals.map((p) => `site:${p}`)]
    : ["site:gov.in", "site:myscheme.gov.in", "site:nic.in"];
  return scopes[index % scopes.length];
}

/**
 * First-round queries for one level. Gemini's question-tailored phrases come first, backfilled with
 * intent templates. Site scoping is applied here (deterministically) rather than left to the model,
 * because model-written site: operators frequently pointed at domains that don't exist.
 */
export function composeLevelQueries(
  level: GovLevel,
  plan: SearchPlan,
  aiPhrases: string[],
  max: number,
): TaggedQuery[] {
  const pool: PhraseCandidate[] = [...aiPhrases.map((phrase) => ({ phrase })), ...templatePhrases(level, plan)];

  const seenPhrases = new Set<string>();
  const seenQueries = new Set<string>();
  const queries: TaggedQuery[] = [];

  for (const candidate of pool) {
    if (queries.length >= max) break;
    const phraseKey = normalizeQuery(candidate.phrase);
    if (!phraseKey || seenPhrases.has(phraseKey)) continue;
    seenPhrases.add(phraseKey);

    const query = `${scopeFor(level, plan, candidate, queries.length)} ${candidate.phrase.trim()}`;
    const queryKey = normalizeQuery(query);
    if (seenQueries.has(queryKey)) continue;
    seenQueries.add(queryKey);
    queries.push({ query, level });
  }
  return queries;
}

/**
 * Alternative queries for a level that came back thin: drop the tight site: scope (unscoped queries
 * still get domain-filtered afterwards) and try single-keyword scoped searches. Bounded by `max`.
 */
export function composeRetryQueries(level: GovLevel, plan: SearchPlan, alreadyRun: Set<string>, max: number): TaggedQuery[] {
  const stateToken = getStateDomainTokens(plan.stateName)[0];
  const candidates: string[] = [];

  for (const intent of plan.intents) {
    const phrase = intent.phrases[0];
    const keyword = intent.keywords[0] ?? "scheme";
    if (level === "central") {
      candidates.push(`${phrase} scheme Government of India official`);
      candidates.push(`site:gov.in ${keyword} scheme`);
      candidates.push(`site:myscheme.gov.in ${keyword}`);
    } else {
      candidates.push(`${plan.stateName} government ${phrase} scheme`);
      if (stateToken) candidates.push(`site:${stateToken} ${keyword} scheme`);
      candidates.push(`${plan.stateName} ${intent.phrases[1] ?? phrase} official`);
    }
  }

  const queries: TaggedQuery[] = [];
  const seen = new Set(alreadyRun);
  for (const query of candidates) {
    if (queries.length >= max) break;
    const key = normalizeQuery(query);
    if (seen.has(key)) continue;
    seen.add(key);
    queries.push({ query, level });
  }
  return queries;
}
