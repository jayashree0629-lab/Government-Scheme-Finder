import { generateQueryPhrases, analyzeSearchResults } from "./geminiService";
import { searchMultipleQueries } from "./serpApiService";
import {
  buildSearchPlan,
  composeLevelQueries,
  composeRetryQueries,
  normalizeQuery,
  relevanceScore,
  type SearchPlan,
  type TaggedQuery,
} from "./queryPlanner";
import { classifySourceLevel, isLowQualitySource, selectAuthoritativeSources } from "../utils/domainFilter";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import type {
  GovLevel,
  LevelCoverage,
  RawSearchResult,
  SchemeResult,
  SearchApiResponse,
  UserProfile,
} from "../types";

const MAX_RESULTS_FOR_ANALYSIS = 36;
const LEVELS: GovLevel[] = ["central", "state"];

function normalizeSchemeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const PLACEHOLDER_TEXT = "Not specified in available sources";

/**
 * Merges schemes that were extracted more than once (e.g. surfaced by two different
 * queries) into a single entry with a deduplicated, combined source list — rather than
 * showing the same scheme twice to the user.
 */
function dedupeSchemes(schemes: SchemeResult[]): SchemeResult[] {
  const byName = new Map<string, SchemeResult>();

  for (const scheme of schemes) {
    const key = normalizeSchemeName(scheme.schemeName);
    const existing = byName.get(key);

    if (!existing) {
      byName.set(key, scheme);
      continue;
    }

    const mergedSourceUrls = new Set(existing.sources.map((s) => s.url));
    const mergedSources = [...existing.sources, ...scheme.sources.filter((s) => !mergedSourceUrls.has(s.url))];

    byName.set(key, {
      ...existing,
      eligibilitySummary: existing.eligibilitySummary === PLACEHOLDER_TEXT ? scheme.eligibilitySummary : existing.eligibilitySummary,
      benefits: existing.benefits === PLACEHOLDER_TEXT ? scheme.benefits : existing.benefits,
      deadline: existing.deadline ?? scheme.deadline,
      applicationLink: existing.applicationLink ?? scheme.applicationLink,
      requiredDocuments: existing.requiredDocuments.length > 0 ? existing.requiredDocuments : scheme.requiredDocuments,
      sources: mergedSources,
      matched: existing.matched ?? scheme.matched,
      needsConfirmation: existing.needsConfirmation ?? scheme.needsConfirmation,
      conflicts: existing.conflicts ?? scheme.conflicts,
      applicationLinkKind: existing.applicationLink ? existing.applicationLinkKind : scheme.applicationLinkKind,
    });
  }

  return [...byName.values()];
}

/** Alternates items from each list (Central, state, Central, state, ...) so neither level crowds out the other. */
function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (list[i] !== undefined) out.push(list[i]);
  }
  return out;
}

function levelName(level: GovLevel, plan: SearchPlan): string {
  return level === "central" ? "Central Government" : `${plan.stateName ?? "State"} Government`;
}

/**
 * Picks the sources handed to Gemini: official, on-topic results for the REQUESTED levels only
 * (Central and the citizen's own state — never another state's portal), ranked by topical relevance
 * within each level and interleaved so both levels are represented.
 */
function selectSourcesForAnalysis(
  all: RawSearchResult[],
  plan: SearchPlan,
  citizenState: string | undefined,
): RawSearchResult[] {
  const requested = LEVELS.filter((l) => plan.levels[l]);
  const official = all.filter((r) => (r.level === "central" || r.level === "state") && requested.includes(r.level));

  const scored = official.map((r) => ({ r, score: relevanceScore(r, plan) }));
  const onTopic = scored.filter((s) => s.score > 0);
  const pool = onTopic.length >= 3 ? onTopic : scored;

  const perLevel = requested.map((level) =>
    pool
      .filter((s) => s.r.level === level)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.r),
  );
  const selected = interleave(perLevel).slice(0, MAX_RESULTS_FOR_ANALYSIS);

  if (selected.length === 0) {
    // No usable official evidence at all: fall back to the best available (a warning is raised by the caller).
    return selectAuthoritativeSources(all, MAX_RESULTS_FOR_ANALYSIS, citizenState);
  }

  if (selected.length < 4) {
    const extras = all.filter(
      (r) => r.level === "non_official" && !isLowQualitySource(r.link) && relevanceScore(r, plan) > 0,
    );
    selected.push(...extras.slice(0, 6));
  }
  return selected;
}

/**
 * Analyses each requested level's sources in its own (parallel) Gemini call. One call over a large
 * mixed pool tended to under-extract — returning a couple of schemes from the level it read first —
 * so each level gets dedicated attention. Results are merged (and deduplicated by the caller).
 * If only some calls fail, the successful levels are still returned with a warning.
 */
async function analyzeByLevel(
  profile: UserProfile,
  sources: RawSearchResult[],
  plan: SearchPlan,
  requestedLevels: GovLevel[],
  warnings: string[],
): Promise<SchemeResult[]> {
  const groups = requestedLevels
    .map((level) => ({ level, sources: sources.filter((r) => r.level === level) }))
    .filter((g) => g.sources.length > 0);
  const hasOtherSources = sources.some((r) => r.level !== "central" && r.level !== "state");

  // Fallback pools (no official evidence) or a single populated level: one call over everything.
  if (groups.length < 2 || hasOtherSources) return analyzeSearchResults(profile, sources, plan);

  const settled = await Promise.allSettled(
    groups.map((g) =>
      analyzeSearchResults(profile, g.sources, {
        ...plan,
        levels: { central: g.level === "central", state: g.level === "state" },
      }),
    ),
  );

  const schemes: SchemeResult[] = [];
  settled.forEach((outcome, i) => {
    if (outcome.status === "fulfilled") {
      schemes.push(...outcome.value);
    } else {
      logger.warn(`Analysis failed for ${groups[i].level} sources`, outcome.reason);
      warnings.push(
        `The AI analysis of ${levelName(groups[i].level, plan)} sources failed this time, so those results may be missing. Try again.`,
      );
    }
  });

  if (settled.every((o) => o.status === "rejected")) {
    const first = settled.find((o): o is PromiseRejectedResult => o.status === "rejected");
    throw first?.reason;
  }
  return schemes;
}

/**
 * Orchestrates the full agent pipeline:
 * profile + question -> plan (requested levels + kinds of benefit) -> Gemini phrases per level
 * -> level-scoped live SerpApi searches (Central AND state) -> bounded retry for any level that came
 * back thin -> keep official, on-topic, level-balanced sources -> Gemini extraction + eligibility
 * -> dedupe -> structured, cited response with real retrieval coverage.
 */
export async function runSchemeFinderAgent(profile: UserProfile): Promise<SearchApiResponse> {
  const warnings: string[] = [];
  const plan = buildSearchPlan(profile);
  const requestedLevels = LEVELS.filter((l) => plan.levels[l]);
  logger.info("Search plan", {
    levels: requestedLevels,
    state: plan.stateName,
    intents: plan.intents.map((i) => i.id),
  });

  const phrases = await generateQueryPhrases(profile, plan);

  const executed = new Map<string, TaggedQuery>();
  const all: RawSearchResult[] = [];
  const seenUrls = new Set<string>();

  async function runRound(candidates: TaggedQuery[]): Promise<void> {
    const remaining = config.maxTotalSearchQueries - executed.size;
    const fresh = candidates.filter((q) => !executed.has(normalizeQuery(q.query))).slice(0, Math.max(0, remaining));
    if (fresh.length === 0) return;
    fresh.forEach((q) => executed.set(normalizeQuery(q.query), q));

    const results = await searchMultipleQueries(fresh.map((q) => q.query));
    for (const result of results) {
      if (seenUrls.has(result.link)) continue;
      seenUrls.add(result.link);
      all.push({ ...result, level: classifySourceLevel(result.link, plan.stateName) });
    }
  }

  const usefulCount = (level: GovLevel) => all.filter((r) => r.level === level && relevanceScore(r, plan) > 0).length;

  // Round 1: every requested level gets its own scoped, topic-diverse queries.
  await runRound(
    requestedLevels.flatMap((level) => composeLevelQueries(level, plan, phrases[level], config.maxQueriesPerLevel)),
  );

  // Round 2 (bounded): only levels that came back thin get alternative queries.
  const retried: Record<GovLevel, boolean> = { central: false, state: false };
  const thinLevels = requestedLevels.filter((level) => usefulCount(level) < config.minUsefulResultsPerLevel);
  if (thinLevels.length > 0) {
    const alreadyRun = new Set(executed.keys());
    const retryQueries = thinLevels.flatMap((level) => {
      const queries = composeRetryQueries(level, plan, alreadyRun, config.maxRetryQueriesPerLevel);
      if (queries.length > 0) retried[level] = true;
      return queries;
    });
    logger.info("Retrying thin levels", { thinLevels, retryQueries: retryQueries.map((q) => q.query) });
    await runRound(retryQueries);
  }

  const queries = [...executed.values()].map((q) => q.query);
  logger.info(`Ran ${queries.length} searches, collected ${all.length} unique results`, queries);

  const coverageFor = (level: GovLevel, selected: RawSearchResult[]): LevelCoverage => ({
    requested: plan.levels[level],
    queriesRun: [...executed.values()].filter((q) => q.level === level).length,
    officialResults: all.filter((r) => r.level === level).length,
    usedInAnalysis: selected.filter((r) => r.level === level).length,
    retried: retried[level],
  });

  if (all.length === 0) {
    warnings.push(
      "No live search results were found for this profile. Try adding more detail (e.g. occupation, education, or a specific question).",
    );
    return {
      queries,
      schemes: [],
      warnings,
      generatedAt: new Date().toISOString(),
      coverage: {
        central: coverageFor("central", []),
        state: coverageFor("state", []),
        totalQueries: queries.length,
        stateName: plan.stateName,
      },
    };
  }

  const selectedResults = selectSourcesForAnalysis(all, plan, profile.state);
  const coverage = {
    central: coverageFor("central", selectedResults),
    state: coverageFor("state", selectedResults),
    totalQueries: queries.length,
    stateName: plan.stateName,
  };

  logger.info(`Sources passed to Gemini (${selectedResults.length})`, {
    central: coverage.central,
    state: coverage.state,
    links: selectedResults.map((r) => `[${r.level}] ${r.link}`),
  });

  if (!all.some((r) => r.level === "central" || r.level === "state")) {
    warnings.push(
      "No official .gov.in / .nic.in sources were found among the results — treat these results with extra caution and verify independently.",
    );
  } else {
    for (const level of requestedLevels) {
      if (coverage[level].usedInAnalysis === 0) {
        const alt = coverage[level].retried ? " (including alternative queries)" : "";
        warnings.push(
          `No official ${levelName(level, plan)} sources were found after ${coverage[level].queriesRun} searches${alt} — results may be incomplete for this level.`,
        );
      }
    }
  }

  const extractedSchemes = await analyzeByLevel(profile, selectedResults, plan, requestedLevels, warnings);
  const schemes = dedupeSchemes(extractedSchemes);

  if (schemes.length === 0) {
    warnings.push(
      "The AI agent could not confidently identify a specific scheme from the current search results. Try rephrasing your question or adding more profile detail.",
    );
  }

  return {
    queries,
    schemes,
    warnings,
    generatedAt: new Date().toISOString(),
    coverage,
  };
}
