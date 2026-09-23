import { generateSearchQueries, analyzeSearchResults } from "./geminiService";
import { searchMultipleQueries } from "./serpApiService";
import { selectAuthoritativeSources } from "../utils/domainFilter";
import { getStateDomainTokens } from "../utils/stateDomains";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import type { SchemeResult, SearchApiResponse, UserProfile } from "../types";

const MAX_RESULTS_FOR_ANALYSIS = 32;

const CENTRAL_QUERY_PATTERN = /site:gov\.in|site:nic\.in|central government|national scholarship|scholarships\.gov\.in|myscheme\.gov\.in/i;

/**
 * Guarantees the query list actually covers both Central Government and the citizen's
 * state, even if the AI-generated list happened to skew toward only one of the two.
 * Never exceeds the configured per-request query cap — it swaps in coverage rather
 * than uncontrollably growing the number of SerpApi calls.
 */
function ensureCentralAndStateCoverage(queries: string[], profile: UserProfile): string[] {
  const result = [...queries];
  const state = profile.state?.trim();

  const hasCentralCoverage = result.some((q) => CENTRAL_QUERY_PATTERN.test(q));
  const hasStateCoverage = state ? result.some((q) => q.toLowerCase().includes(state.toLowerCase())) : true;

  const additions: string[] = [];
  if (!hasCentralCoverage) {
    additions.push("central government welfare scheme scholarship India site:gov.in OR site:nic.in");
  }
  if (state && !hasStateCoverage) {
    const stateDomainTokens = getStateDomainTokens(state);
    const siteFilter = stateDomainTokens.length > 0 ? `site:${stateDomainTokens[0]}` : "site:gov.in";
    additions.push(`${state} state government scheme scholarship ${siteFilter}`);
  }

  for (const addition of additions) {
    if (result.length < config.maxSearchQueriesPerRequest) {
      result.push(addition);
    } else {
      result[result.length - 1] = addition;
    }
  }

  return result;
}

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
    });
  }

  return [...byName.values()];
}

/**
 * Orchestrates the full agent pipeline:
 * profile -> generate queries (with guaranteed Central + state coverage) -> live SerpApi
 * search -> keep only authoritative sources -> Gemini extraction + eligibility comparison
 * -> dedupe -> structured, cited response.
 */
export async function runSchemeFinderAgent(profile: UserProfile): Promise<SearchApiResponse> {
  const warnings: string[] = [];

  const generatedQueries = await generateSearchQueries(profile);
  const queries = ensureCentralAndStateCoverage(generatedQueries, profile);
  logger.info("Generated search queries", queries);

  const rawResults = await searchMultipleQueries(queries);
  logger.info(`Collected ${rawResults.length} unique live search results`);

  if (rawResults.length === 0) {
    warnings.push(
      "No live search results were found for this profile. Try adding more detail (e.g. occupation, education, or a specific question).",
    );
    return { queries, schemes: [], warnings, generatedAt: new Date().toISOString() };
  }

  const officialRawCount = rawResults.filter((r) => r.isOfficialSource).length;
  const selectedResults = selectAuthoritativeSources(rawResults, MAX_RESULTS_FOR_ANALYSIS, profile.state);

  logger.info(
    `Sources passed to Gemini (${selectedResults.length}, ${officialRawCount} official found overall):`,
    selectedResults.map((r) => `[${r.isOfficialSource ? "OFFICIAL" : "other"}] ${r.link}`),
  );

  if (officialRawCount === 0) {
    warnings.push(
      "No official .gov.in / .nic.in sources were found among the results — treat these results with extra caution and verify independently.",
    );
  }

  const extractedSchemes = await analyzeSearchResults(profile, selectedResults);
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
  };
}
