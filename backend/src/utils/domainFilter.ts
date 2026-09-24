import type { SourceLevel } from "../types";
import { ALL_STATE_DOMAIN_TOKENS, getStateDomainTokens, hostnameMatchesDomain } from "./stateDomains";

const OFFICIAL_DOMAIN_SUFFIXES = [".gov.in", ".nic.in"];

const OFFICIAL_KNOWN_DOMAINS = new Set([
  "india.gov.in",
  "tn.gov.in",
  "myscheme.gov.in",
  "scholarships.gov.in",
  "nsp.gov.in",
  "pmkisan.gov.in",
  "dbtbharat.gov.in",
]);

// Coaching sites, news outlets, blogs, forums and other non-authoritative aggregators
// that sometimes rank highly for scheme-related searches but must never be treated as
// the source of truth for eligibility/benefit/deadline facts when an official page exists.
const LOW_QUALITY_DOMAIN_MARKERS = [
  "blogspot.",
  "wordpress.",
  "medium.com",
  "quora.com",
  "reddit.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "byjus.com",
  "shiksha.com",
  "collegedunia.com",
  "getmyuni.com",
  "careers360.com",
  "jagranjosh.com",
  "sarkariresult",
  "sarkariyojana",
  "yojanaguide",
  "timesofindia.",
  "indiatoday.",
  "hindustantimes.",
  "ndtv.com",
  "news18.com",
  "amarujala.",
  "livemint.com",
  "economictimes.",
  "thehindu.com",
  "indianexpress.com",
  "deccanherald.com",
  "thenewsminute.com",
  "dinamalar.",
  "dinamani.",
];

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isOfficialGovernmentSource(url: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;

  if (OFFICIAL_KNOWN_DOMAINS.has(hostname)) return true;

  return OFFICIAL_DOMAIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

export function isLowQualitySource(url: string): boolean {
  const hostname = getHostname(url);
  if (!hostname) return true;
  return LOW_QUALITY_DOMAIN_MARKERS.some((marker) => hostname.includes(marker));
}

/**
 * True when the URL belongs to a state government's domain that is NOT the citizen's own
 * state (e.g. an Odisha or Gujarat scholarship portal surfaced for a Tamil Nadu citizen).
 * Such a source is still a genuine official government source in general, but it is not
 * relevant to this citizen's request, so it should not be treated as authoritative here.
 */
export function isOtherStateGovernmentSource(url: string, citizenState: string | undefined): boolean {
  const hostname = getHostname(url);
  if (!hostname) return false;

  const citizenTokens = new Set(getStateDomainTokens(citizenState));
  const otherStateTokens = ALL_STATE_DOMAIN_TOKENS.filter((token) => !citizenTokens.has(token));

  return otherStateTokens.some((token) => hostnameMatchesDomain(hostname, token));
}



/**
 * Classifies a URL for retrieval accounting. "state" means the citizen's OWN state; an official
 * portal of any other state is "other_state" (never counted as Central or as the citizen's state);
 * a non-.gov.in/.nic.in site is "non_official" and is never counted as government evidence.
 */
export function classifySourceLevel(url: string, citizenState: string | undefined): SourceLevel {
  const hostname = getHostname(url);
  if (!hostname || !isOfficialGovernmentSource(url)) return "non_official";

  const ownTokens = getStateDomainTokens(citizenState);
  if (ownTokens.some((token) => hostnameMatchesDomain(hostname, token))) return "state";
  if (isOtherStateGovernmentSource(url, citizenState)) return "other_state";
  return "central";
}

/**
 * Selects and orders the sources handed to the AI agent for extraction/eligibility analysis.
 *
 * Official .gov.in / .nic.in sources for Central Government or the citizen's OWN state always
 * come first. Blogs, coaching sites, news outlets, other non-authoritative aggregators, AND
 * official portals belonging to a DIFFERENT state than the citizen's are dropped entirely
 * whenever enough relevant official coverage was found — they must never be "treated as
 * authoritative when an official source is available" for this citizen's request. If NO
 * relevant official source was found at all, everything else is kept (better than returning
 * nothing) and the caller is expected to surface a caution warning.
 */
export function selectAuthoritativeSources<T extends { link: string }>(
  results: T[],
  limit: number,
  citizenState?: string,
): T[] {
  const isRelevantOfficial = (link: string) =>
    isOfficialGovernmentSource(link) && !isOtherStateGovernmentSource(link, citizenState);

  const relevantOfficial = results.filter((r) => isRelevantOfficial(r.link));
  const rest = results.filter((r) => !isRelevantOfficial(r.link));

  if (relevantOfficial.length > 0) {
    const trustworthyRest = rest.filter(
      (r) => !isLowQualitySource(r.link) && !isOtherStateGovernmentSource(r.link, citizenState),
    );
    return [...relevantOfficial, ...trustworthyRest].slice(0, limit);
  }

  return [...rest].slice(0, limit);
}
