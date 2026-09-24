export interface UserProfile {
  age?: number;
  state?: string;
  occupation?: string;
  education?: string;
  familyIncome?: number;
  category?: string;
  freeText?: string;
}

export type MatchStatus = "likely_eligible" | "possibly_eligible" | "not_matching";

export interface SchemeSource {
  url: string;
  snippet: string;
  retrievedAt: string;
}

export interface SchemeResult {
  schemeName: string;
  department: string;
  eligibilitySummary: string;
  matchStatus: MatchStatus;
  matchReason: string;
  benefits: string;
  requiredDocuments: string[];
  deadline: string | null;
  applicationLink: string | null;
  sources: SchemeSource[];
}

export interface SearchApiResponse {
  queries: string[];
  schemes: SchemeResult[];
  warnings: string[];
  generatedAt: string;
  coverage?: RetrievalCoverage;
}

export interface RawSearchResult {
  title: string;
  link: string;
  snippet: string;
  isOfficialSource: boolean;
  sourceQuery: string;
  retrievedAt: string;
  level?: SourceLevel;
}

export type GovLevel = "central" | "state";
export type SourceLevel = "central" | "state" | "other_state" | "non_official";

export interface LevelCoverage {
  requested: boolean;
  queriesRun: number;
  /** Official results whose domain belongs to this level (Central, or the citizen's own state). */
  officialResults: number;
  /** How many of those were relevant enough to be passed to Gemini. */
  usedInAnalysis: number;
  retried: boolean;
}

/** Retrieval accounting derived from the real SerpApi results (never invented). */
export interface RetrievalCoverage {
  central: LevelCoverage;
  state: LevelCoverage;
  totalQueries: number;
  stateName?: string;
}
