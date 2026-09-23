/**
 * Best-effort map of Indian state/UT names (matching the frontend's state dropdown) to their
 * primary official government domain token(s). Used to (a) build a correct site: query for the
 * citizen's own state, and (b) recognize when an official-looking .gov.in/.nic.in result actually
 * belongs to a DIFFERENT state than the citizen's — which makes it not relevant here, even though
 * it is a legitimate official source in general.
 */
export const STATE_DOMAIN_TOKENS: Record<string, string[]> = {
  "Tamil Nadu": ["tn.gov.in"],
  "Andhra Pradesh": ["ap.gov.in"],
  "Arunachal Pradesh": ["arunachalpradesh.gov.in"],
  Assam: ["assam.gov.in"],
  Bihar: ["bihar.gov.in"],
  Chhattisgarh: ["cg.gov.in", "cg.nic.in"],
  Goa: ["goa.gov.in"],
  Gujarat: ["gujarat.gov.in"],
  Haryana: ["haryana.gov.in"],
  "Himachal Pradesh": ["hp.gov.in", "himachal.nic.in"],
  Jharkhand: ["jharkhand.gov.in"],
  Karnataka: ["karnataka.gov.in"],
  Kerala: ["kerala.gov.in"],
  "Madhya Pradesh": ["mp.gov.in"],
  Maharashtra: ["maharashtra.gov.in"],
  Manipur: ["manipur.gov.in"],
  Meghalaya: ["meghalaya.gov.in"],
  Mizoram: ["mizoram.gov.in"],
  Nagaland: ["nagaland.gov.in"],
  Odisha: ["odisha.gov.in"],
  Punjab: ["punjab.gov.in"],
  Rajasthan: ["rajasthan.gov.in"],
  Sikkim: ["sikkim.gov.in"],
  Telangana: ["telangana.gov.in", "cgg.gov.in"],
  Tripura: ["tripura.gov.in"],
  "Uttar Pradesh": ["up.gov.in"],
  Uttarakhand: ["uk.gov.in"],
  "West Bengal": ["wb.gov.in"],
  "Delhi (NCT)": ["delhi.gov.in"],
  "Jammu and Kashmir": ["jk.gov.in"],
};

export function getStateDomainTokens(stateName: string | undefined): string[] {
  if (!stateName) return [];
  return STATE_DOMAIN_TOKENS[stateName.trim()] ?? [];
}

/** Every known state domain token, used to recognize an "other state" official source. */
export const ALL_STATE_DOMAIN_TOKENS: string[] = Object.values(STATE_DOMAIN_TOKENS).flat();
