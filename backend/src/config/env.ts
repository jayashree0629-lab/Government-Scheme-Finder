import "dotenv/config";

interface AppConfig {
  port: number;
  nodeEnv: string;
  frontendOrigin: string;
  serpApiKey: string | undefined;
  geminiApiKey: string | undefined;
  geminiModel: string;
  maxSearchQueriesPerRequest: number;
  maxResultsPerQuery: number;
  maxQueriesPerLevel: number;
  maxRetryQueriesPerLevel: number;
  maxTotalSearchQueries: number;
  minUsefulResultsPerLevel: number;
  maxSearchesPerHour: number;
  maxConcurrentSearches: number;
}

function parseIntEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const config: AppConfig = {
  port: parseIntEnv(process.env.PORT, 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  serpApiKey: process.env.SERPAPI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
  maxSearchQueriesPerRequest: parseIntEnv(process.env.MAX_SEARCH_QUERIES_PER_REQUEST, 6),
  maxResultsPerQuery: parseIntEnv(process.env.MAX_RESULTS_PER_QUERY, 6),
  // Bounded retrieval budget: first-round queries per government level, retry queries per level that
  // came back thin, an absolute cap across everything, and what counts as "enough" per level.
  maxQueriesPerLevel: parseIntEnv(process.env.MAX_QUERIES_PER_LEVEL, 4),
  maxRetryQueriesPerLevel: parseIntEnv(process.env.MAX_RETRY_QUERIES_PER_LEVEL, 2),
  maxTotalSearchQueries: parseIntEnv(process.env.MAX_TOTAL_SEARCH_QUERIES, 12),
  minUsefulResultsPerLevel: parseIntEnv(process.env.MIN_USEFUL_RESULTS_PER_LEVEL, 3),
  // Cost/abuse protection: each /api/search fans out to many SerpApi + Gemini calls.
  maxSearchesPerHour: parseIntEnv(process.env.MAX_SEARCHES_PER_HOUR, 150),
  maxConcurrentSearches: parseIntEnv(process.env.MAX_CONCURRENT_SEARCHES, 4),
};

export function logConfigWarnings(): void {
  if (!config.serpApiKey) {
    console.warn(
      "[config] SERPAPI_API_KEY is not set. Requests to /api/search will fail until it is configured in backend/.env",
    );
  }
  if (!config.geminiApiKey) {
    console.warn(
      "[config] GEMINI_API_KEY is not set. Requests to /api/search will fail until it is configured in backend/.env",
    );
  }
}
