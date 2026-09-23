export interface UserProfileInput {
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
}
