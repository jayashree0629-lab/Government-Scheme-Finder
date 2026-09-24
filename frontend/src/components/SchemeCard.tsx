import type { ReactNode } from "react";
import type { MatchStatus, SchemeResult, UserProfileInput } from "../types/scheme";
import { EligibilityBadge } from "./EligibilityBadge";
import { Disclosure } from "./Disclosure";
import { isOfficialUrl, getHostname, getUniqueDomains, safeHref } from "../utils/sources";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, LinkArrowIcon, QuestionCircleIcon, XCircleIcon } from "./icons";

const PLACEHOLDER_TEXT = "Not specified in available sources";

const STATUS_ACCENT: Record<MatchStatus, string> = {
  likely_eligible: "border-l-emerald-400",
  possibly_eligible: "border-l-amber-400",
  not_matching: "border-l-slate-300",
};

const WHY_HEADING: Record<MatchStatus, string> = {
  likely_eligible: "Why this result",
  possibly_eligible: "Why this result — and what to confirm",
  not_matching: "Why this doesn't match",
};

// Generic framing per status. None of these add facts about the scheme — they only explain what
// the status means and remind the citizen that this is not an official decision.
const STATUS_NOTE: Record<MatchStatus, string> = {
  likely_eligible:
    "Likely Eligible means your profile appears to fit the criteria we could read. It is not an official eligibility decision.",
  possibly_eligible:
    "Some conditions could not be confirmed from your profile or the retrieved sources (see the explanation above). This is not an official eligibility decision — verify on the official portal.",
  not_matching:
    "Based on the criteria we found, this scheme does not appear to match your profile. Rules can differ from what was retrieved, so check the official portal if unsure.",
};

/** Formatting only: splits real text on newlines, bullets or semicolons so it can be scanned as a list. */
function toListItems(text: string): string[] {
  return text
    .split(/\r?\n|•|;/)
    .map((s) => s.trim().replace(/^[-–*]\s*/, ""))
    .filter(Boolean);
}

function SectionHeading({ children }: { children: ReactNode }) {
  return <h4 className="text-sm sm:text-[15px] font-bold uppercase tracking-wider text-slate-500">{children}</h4>;
}

function TextOrList({ text }: { text: string }) {
  const items = toListItems(text);
  if (items.length > 1) {
    return (
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-base sm:text-lg leading-relaxed text-slate-800">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-base sm:text-lg leading-relaxed text-slate-800">{text}</p>;
}

export function SchemeCard({ scheme, profile }: { scheme: SchemeResult; profile: UserProfileInput | undefined }) {
  const officialSources = scheme.sources.filter((s) => isOfficialUrl(s.url));
  const hasBenefits = Boolean(scheme.benefits) && scheme.benefits !== PLACEHOLDER_TEXT;
  const hasEligibility = Boolean(scheme.eligibilitySummary) && scheme.eligibilitySummary !== PLACEHOLDER_TEXT;
  const domains = getUniqueDomains(scheme.sources);
  const primarySourceUrl = officialSources[0]?.url ?? scheme.sources[0]?.url;
  const showSeparateSourceButton = primarySourceUrl && primarySourceUrl !== scheme.applicationLink;
  // Never call a link "official" unless its domain is a government domain (.gov.in / .nic.in).
  const linkIsOfficial = isOfficialUrl(scheme.applicationLink ?? "");
  const linkLabel = !linkIsOfficial
    ? "Source page (not a .gov.in / .nic.in site)"
    : scheme.applicationLinkKind === "application"
      ? "Apply on official portal"
      : "Official information page";
  const primarySourceIsOfficial = isOfficialUrl(primarySourceUrl ?? "");

  const profileBits = profile
    ? [
        profile.age !== undefined ? `${profile.age} years` : null,
        profile.state,
        profile.occupation,
        profile.education,
        profile.familyIncome !== undefined ? `₹${profile.familyIncome.toLocaleString("en-IN")}/yr` : null,
        profile.category,
      ].filter((v): v is string => Boolean(v))
    : [];

  return (
    <article
      className={`rounded-2xl border border-slate-200 border-l-[6px] ${STATUS_ACCENT[scheme.matchStatus]} bg-white shadow-sm transition-shadow hover:shadow-md`}
    >
      {/* ---- Header: status, title, source ---- */}
      <header className="p-6 sm:p-8 lg:p-10 pb-0 sm:pb-0 lg:pb-0">
        <div className="flex flex-wrap items-center gap-3">
          <EligibilityBadge status={scheme.matchStatus} size="lg" />
          {scheme.deadline && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-semibold text-amber-800">
              <CalendarIcon className="h-4 w-4" />
              Deadline: {scheme.deadline}
            </span>
          )}
        </div>

        <h3 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-slate-900 text-balance">
          {scheme.schemeName}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-base text-slate-600">
          <span className="inline-flex items-center gap-2">
            <BuildingIcon className="h-4 w-4 shrink-0 text-slate-400" />
            {scheme.department}
          </span>
          {domains[0] && (
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">{getHostname(primarySourceUrl ?? domains[0])}</span>
              {officialSources.length > 0 && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700 border border-emerald-200">
                  Official source
                </span>
              )}
            </span>
          )}
        </div>
      </header>

      <div className="p-6 sm:p-8 lg:p-10 pt-6 sm:pt-8 lg:pt-8 space-y-8">
        {/* ---- WHY THIS RESULT (prominent) ---- */}
        <section
          aria-label={WHY_HEADING[scheme.matchStatus]}
          className="rounded-xl border border-accent-200 bg-accent-50/70 p-5 sm:p-6"
        >
          <h4 className="text-sm sm:text-[15px] font-bold uppercase tracking-wider text-accent-700">
            {WHY_HEADING[scheme.matchStatus]}
          </h4>
          <p className="mt-3 text-lg sm:text-xl leading-relaxed text-slate-900">
            {scheme.matchReason || PLACEHOLDER_TEXT}
          </p>

          {profileBits.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-500">Your details considered:</span>
              {profileBits.map((bit) => (
                <span
                  key={bit}
                  className="rounded-full border border-accent-200 bg-white px-3 py-1 text-sm font-medium text-slate-700"
                >
                  {bit}
                </span>
              ))}
            </div>
          )}

          {Boolean(scheme.matched?.length || scheme.needsConfirmation?.length || scheme.conflicts?.length) && (
            <div className="mt-5 grid gap-5 border-t border-accent-200 pt-5 sm:grid-cols-2">
              <EvidenceList title="Matches your profile" items={scheme.matched} tone="ok" />
              <EvidenceList title="Needs confirmation" items={scheme.needsConfirmation} tone="warn" />
              <EvidenceList title="Conflicts with your profile" items={scheme.conflicts} tone="bad" />
            </div>
          )}

          <div className="mt-4 -mb-2">
            <Disclosure label="See how this was assessed">
              <AssessmentSteps profileBits={profileBits} scheme={scheme} />
            </Disclosure>
          </div>
        </section>

        {/* ---- BENEFITS | ELIGIBILITY ---- */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section>
            <SectionHeading>What you may get</SectionHeading>
            <div className="mt-3">
              {hasBenefits ? <TextOrList text={scheme.benefits} /> : <p className="text-base text-slate-500">{PLACEHOLDER_TEXT}</p>}
            </div>
          </section>

          <section>
            <SectionHeading>Eligibility</SectionHeading>
            <div className="mt-3">
              {hasEligibility ? (
                <TextOrList text={scheme.eligibilitySummary} />
              ) : (
                <p className="text-base text-slate-500">{PLACEHOLDER_TEXT}</p>
              )}
            </div>
            <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm sm:text-[15px] leading-relaxed text-slate-600">
              {STATUS_NOTE[scheme.matchStatus]}
            </p>
          </section>
        </div>

        {/* ---- DOCUMENTS | SOURCES ---- */}
        <div className="grid gap-8 border-t border-slate-200 pt-8 lg:grid-cols-2 lg:gap-12">
          <section>
            <SectionHeading>Documents</SectionHeading>
            <div className="mt-3">
              {scheme.requiredDocuments.length > 0 ? (
                <ul className="space-y-2.5">
                  {scheme.requiredDocuments.map((doc) => (
                    <li key={doc} className="flex items-start gap-3 text-base sm:text-lg leading-relaxed text-slate-800">
                      <CheckCircleIcon className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
                      {doc}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base leading-relaxed text-slate-500">
                  Required documents were not clearly identified in the retrieved official sources. Verify on the official portal.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionHeading>
              Sources{officialSources.length > 0 ? ` · ${officialSources.length} official` : ""}
            </SectionHeading>
            <ul className="mt-3 space-y-2.5">
              {scheme.sources.map((source) => (
                <li key={source.url} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base">
                  <span className="font-mono text-sm sm:text-[15px] text-slate-700 break-all">{getHostname(source.url)}</span>
                  {isOfficialUrl(source.url) && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-700 border border-emerald-200">
                      Official
                    </span>
                  )}
                  <a
                    href={safeHref(source.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
                    aria-label={`View source ${getHostname(source.url)} (opens in a new tab)`}
                  >
                    View source
                    <LinkArrowIcon className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <Disclosure label={`Show evidence excerpts (${scheme.sources.length})`}>
                <div className="space-y-4">
                  {scheme.sources.map((source) => (
                    <div key={source.url} className="text-sm text-slate-600">
                      <div className="font-mono text-xs text-slate-500">{getHostname(source.url)}</div>
                      {source.supports && source.supports.length > 0 && (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent-700">
                          Supports: {source.supports.join(", ")}
                        </p>
                      )}
                      {source.snippet && <p className="mt-1 leading-relaxed">&ldquo;{source.snippet}&rdquo;</p>}
                      <p className="mt-1 text-xs text-slate-400">
                        Retrieved {new Date(source.retrievedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Disclosure>
            </div>
          </section>
        </div>

        {/* ---- Actions ---- */}
        {(scheme.applicationLink || showSeparateSourceButton) && (
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            {showSeparateSourceButton && primarySourceUrl && (
              <a
                href={safeHref(primarySourceUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                aria-label={`View official source for ${scheme.schemeName} (opens in a new tab)`}
              >
                {primarySourceIsOfficial ? "View Official Source" : "View source (not a .gov.in / .nic.in site)"}
                <LinkArrowIcon className="h-4 w-4" />
              </a>
            )}
            {scheme.applicationLink && (
              <a
                href={safeHref(scheme.applicationLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                aria-label={`${linkLabel} for ${scheme.schemeName} (opens in a new tab)`}
              >
                {linkLabel}
                <LinkArrowIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function EvidenceList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[] | undefined;
  tone: "ok" | "warn" | "bad";
}) {
  if (!items || items.length === 0) return null;
  const Icon = tone === "ok" ? CheckCircleIcon : tone === "warn" ? QuestionCircleIcon : XCircleIcon;
  const color = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-slate-500";
  return (
    <div>
      <h5 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h5>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-base leading-relaxed text-slate-800">
            <Icon className={`mt-1 h-5 w-5 shrink-0 ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Built only from real fields already on the scheme/profile — no criteria are invented. */
function AssessmentSteps({ profileBits, scheme }: { profileBits: string[]; scheme: SchemeResult }) {
  const steps = [
    { label: "Your profile", content: profileBits.length > 0 ? profileBits.join(" · ") : "No structured profile fields were provided." },
    { label: "Retrieved requirements", content: scheme.eligibilitySummary },
    { label: "Match reasoning", content: scheme.matchReason || PLACEHOLDER_TEXT },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
              {i + 1}
            </span>
            <span className="mt-1 w-px flex-1 bg-slate-200" />
          </div>
          <div className="pb-1">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{step.label}</div>
            <p className="mt-0.5 text-base text-slate-700">{step.content}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
          {steps.length + 1}
        </span>
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Result status</div>
          <div className="mt-1">
            <EligibilityBadge status={scheme.matchStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
