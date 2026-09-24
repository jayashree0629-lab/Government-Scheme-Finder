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

export type SourceSupport = "scheme" | "eligibility" | "benefits" | "documents" | "deadline";

export interface SchemeSource {
  url: string;
  snippet: string;
  retrievedAt: string;
  /** What this source was verified to support (only set when the excerpt is verbatim from the source). */
  supports?: SourceSupport[];
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
  /** Profile facts that satisfy a documented criterion (only when evidenced). */
  matched?: string[];
  /** Required criteria the profile does not cover, so eligibility cannot be confirmed. */
  needsConfirmation?: string[];
  /** A known profile fact that explicitly contradicts a documented requirement. */
  conflicts?: string[];
  /** "application" only when the evidence shows the link is where you apply; otherwise "information". */
  applicationLinkKind?: "application" | "information";
}

export interface SearchApiResponse {
  queries: string[];
  schemes: SchemeResult[];
  warnings: string[];
  generatedAt: string;
}
