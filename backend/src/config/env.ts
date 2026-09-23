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
