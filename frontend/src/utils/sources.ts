import type { SchemeResult, UserProfileInput } from "../types/scheme";

/**
 * Mirrors the backend's official-domain check (backend/src/utils/domainFilter.ts) for display
 * purposes only — it does not re-filter results, just labels sources the backend already returned.
 */
const KNOWN_OFFICIAL_DOMAINS = new Set([
  "india.gov.in",
  "tn.gov.in",
  "myscheme.gov.in",
  "scholarships.gov.in",
  "nsp.gov.in",
  "pmkisan.gov.in",
  "dbtbharat.gov.in",
]);

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Unique source domains across a scheme's sources, in first-seen order. */
export function getUniqueDomains(sources: { url: string }[]): string[] {
  const seen = new Set<string>();
  const domains: string[] = [];
  for (const s of sources) {
    const host = getHostname(s.url);
    if (!seen.has(host)) {
      seen.add(host);
      domains.push(host);
    }
  }
  return domains;
}

export function isOfficialUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return KNOWN_OFFICIAL_DOMAINS.has(hostname) || hostname.endsWith(".gov.in") || hostname.endsWith(".nic.in");
  } catch {
    return false;
  }
}

// Central-government portals that are not state-specific, used only to distinguish "Central"
// from "state" coverage in the benefit-match summary. Not an eligibility or filtering decision —
// purely a display label derived from the sources the backend already returned.
const KNOWN_CENTRAL_DOMAINS = new Set([
  "india.gov.in",
  "myscheme.gov.in",
  "scholarships.gov.in",
  "nsp.gov.in",
  "pmkisan.gov.in",
  "dbtbharat.gov.in",
  "education.gov.in",
  "socialjustice.gov.in",
  "eshram.gov.in",
  "pib.gov.in",
]);

function isCentralSourceUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return KNOWN_CENTRAL_DOMAINS.has(hostname);
  } catch {
    return false;
  }
}

function isStateSourceUrl(url: string, stateName: string | undefined): boolean {
  if (!isOfficialUrl(url) || isCentralSourceUrl(url)) return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (stateName?.trim() === "Tamil Nadu") return hostname.endsWith("tn.gov.in");
    // For states other than Tamil Nadu we don't carry a full domain map on the frontend —
    // any official, non-central source is presumed state-specific (the backend already
    // excludes other-states' sources before returning results, so this holds for the MVP).
    return true;
  } catch {
    return false;
  }
}

export interface SourceCoverage {
  hasCentral: boolean;
  hasState: boolean;
  stateName: string | undefined;
}

/** Derived purely from the URLs already present in the returned schemes — never invented. */
export function computeSourceCoverage(schemes: SchemeResult[], profile: UserProfileInput | undefined): SourceCoverage {
  const allUrls = schemes.flatMap((s) => s.sources.map((src) => src.url));
  return {
    hasCentral: allUrls.some(isCentralSourceUrl),
    hasState: allUrls.some((url) => isStateSourceUrl(url, profile?.state)),
    stateName: profile?.state,
  };
}

export interface MatchCounts {
  total: number;
  likely: number;
  possible: number;
  notMatching: number;
}

export function computeMatchCounts(schemes: SchemeResult[]): MatchCounts {
  return {
    total: schemes.length,
    likely: schemes.filter((s) => s.matchStatus === "likely_eligible").length,
    possible: schemes.filter((s) => s.matchStatus === "possibly_eligible").length,
    notMatching: schemes.filter((s) => s.matchStatus === "not_matching").length,
  };
}
