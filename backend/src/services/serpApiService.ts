import axios from "axios";
import { config } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { isOfficialGovernmentSource } from "../utils/domainFilter";
import type { RawSearchResult } from "../types";

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

interface SerpApiOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
}

interface SerpApiResponse {
  organic_results?: SerpApiOrganicResult[];
  error?: string;
}

/**
 * Runs one live Google search through SerpApi for a single query string.
 * This is the only module in the codebase allowed to talk to SerpApi directly.
 */
export async function searchGovernmentSources(query: string): Promise<RawSearchResult[]> {
  if (!config.serpApiKey) {
    throw new AppError(
      "Live search is unavailable because SERPAPI_API_KEY is not configured on the server.",
      503,
    );
  }

  const retrievedAt = new Date().toISOString();

  try {
    const response = await axios.get<SerpApiResponse>(SERPAPI_ENDPOINT, {
      params: {
        engine: "google",
        q: query,
        api_key: config.serpApiKey,
        google_domain: "google.co.in",
        gl: "in",
        hl: "en",
        num: config.maxResultsPerQuery,
      },
      timeout: 15000,
    });

    if (response.data.error) {
      throw new AppError(`SerpApi returned an error: ${response.data.error}`, 502);
    }

    const organicResults = response.data.organic_results ?? [];

    return organicResults
      .filter((result) => Boolean(result.link))
      .slice(0, config.maxResultsPerQuery)
      .map((result) => ({
        title: result.title ?? "Untitled result",
        link: result.link as string,
        snippet: result.snippet ?? "",
        isOfficialSource: isOfficialGovernmentSource(result.link as string),
        sourceQuery: query,
        retrievedAt,
      }));
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (axios.isAxiosError(error)) {
      logger.error("SerpApi request failed", {
        query,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new AppError("SerpApi rejected the request — check SERPAPI_API_KEY.", 502);
      }
      throw new AppError("Live search via SerpApi failed. Please try again shortly.", 502);
    }

    logger.error("Unexpected SerpApi failure", error);
    throw new AppError("Live search via SerpApi failed unexpectedly.", 502);
  }
}

/**
 * Runs multiple SerpApi searches (one per generated query) and flattens the results,
 * deduplicating by URL. Individual query failures are logged and skipped rather than
 * failing the whole request, so one bad query doesn't sink the entire search.
 */
export async function searchMultipleQueries(queries: string[]): Promise<RawSearchResult[]> {
  const boundedQueries = queries.slice(0, config.maxSearchQueriesPerRequest);

  const settled = await Promise.allSettled(boundedQueries.map((query) => searchGovernmentSources(query)));

  const seenUrls = new Set<string>();
  const combined: RawSearchResult[] = [];

  settled.forEach((outcome, index) => {
    if (outcome.status === "fulfilled") {
      for (const result of outcome.value) {
        if (!seenUrls.has(result.link)) {
          seenUrls.add(result.link);
          combined.push(result);
        }
      }
    } else {
      logger.warn(`Query failed and was skipped: "${boundedQueries[index]}"`, outcome.reason);
    }
  });

  if (combined.length === 0 && boundedQueries.length > 0) {
    const allFailed = settled.every((outcome) => outcome.status === "rejected");
    if (allFailed) {
      const firstRejection = settled.find(
        (outcome): outcome is PromiseRejectedResult => outcome.status === "rejected",
      );
      const reason = firstRejection?.reason;
      if (reason instanceof AppError) throw reason;
      throw new AppError("Live search via SerpApi failed for all generated queries.", 502);
    }
  }

  return combined;
}
