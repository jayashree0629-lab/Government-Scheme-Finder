import type { SchemeResult, UserProfileInput } from "../types/scheme";
import { EligibilityBadge } from "./EligibilityBadge";
import { Disclosure } from "./Disclosure";
import { isOfficialUrl, getHostname, getUniqueDomains } from "../utils/sources";
import { BuildingIcon, CalendarIcon, CheckCircleIcon, LinkArrowIcon } from "./icons";

const PLACEHOLDER_TEXT = "Not specified in available sources";

const STATUS_ACCENT: Record<SchemeResult["matchStatus"], string> = {
  likely_eligible: "border-l-emerald-400",
  possibly_eligible: "border-l-amber-400",
  not_matching: "border-l-slate-300",
};

export function SchemeCard({ scheme, profile }: { scheme: SchemeResult; profile: UserProfileInput | undefined }) {
  const officialSourceCount = scheme.sources.filter((s) => isOfficialUrl(s.url)).length;
  const hasBenefits = scheme.benefits && scheme.benefits !== PLACEHOLDER_TEXT;
  const domains = getUniqueDomains(scheme.sources);

  return (
    <article
      className={`rounded-2xl border border-slate-200 border-l-4 ${STATUS_ACCENT[scheme.matchStatus]} bg-white p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md`}
    >
      <EligibilityBadge status={scheme.matchStatus} size="md" />

      <h3 className="mt-2.5 text-xl sm:text-2xl font-bold text-slate-900 leading-snug text-balance">
        {scheme.schemeName}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
        <BuildingIcon className="h-3.5 w-3.5 shrink-0" />
        {scheme.department}
      </p>

      {scheme.matchReason && (
        <p className="mt-4 border-l-2 border-accent-300 pl-4 text-[15px] leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">You may match because </span>
          {scheme.matchReason}
        </p>
      )}

      {hasBenefits && (
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Benefit</div>
          <p className="mt-1 text-[15px] text-slate-800">{scheme.benefits}</p>
        </div>
      )}

      {scheme.deadline && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-800">
          <CalendarIcon className="h-3.5 w-3.5" />
          Deadline: {scheme.deadline}
        </p>
      )}

      {domains.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {domains.map((domain) => (
            <span
              key={domain}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-500"
            >
              {domain}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
        <Disclosure label="Why this result?">
          <WhyThisResultFlow profile={profile} scheme={scheme} />
        </Disclosure>

        <Disclosure label={`Documents${scheme.requiredDocuments.length > 0 ? ` (${scheme.requiredDocuments.length})` : ""}`}>
          {scheme.requiredDocuments.length > 0 ? (
            <ul className="space-y-1.5">
              {scheme.requiredDocuments.map((doc) => (
                <li key={doc} className="flex items-start gap-1.5">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  {doc}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">May be required — verify on official portal.</p>
          )}
        </Disclosure>

        <Disclosure
          label={`Evidence (${scheme.sources.length} source${scheme.sources.length === 1 ? "" : "s"}${officialSourceCount > 0 ? `, ${officialSourceCount} official` : ""})`}
        >
          <div className="space-y-3">
            {scheme.sources.map((source) => (
              <div key={source.url} className="text-xs text-slate-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-600 hover:underline break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
                  >
                    {getHostname(source.url)}
                  </a>
                  {isOfficialUrl(source.url) && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      Official
                    </span>
                  )}
                </div>
                {source.snippet && <p className="mt-0.5 text-slate-500">&ldquo;{source.snippet}&rdquo;</p>}
                <p className="mt-0.5 text-slate-400">Retrieved {new Date(source.retrievedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Disclosure>
      </div>

      {scheme.applicationLink && (
        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <a
            href={scheme.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-accent-200 bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700 transition hover:bg-accent-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            aria-label={`Official source for ${scheme.schemeName} (opens in a new tab)`}
          >
            Official source
            <LinkArrowIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </article>
  );
}

/**
 * The "why this result" signature visual: a short narrative chain from the citizen's own
 * profile, through what the sources actually say, to the reasoning and final status — built
 * entirely from real fields already on the scheme/profile. No criteria are invented: when the
 * backend doesn't provide a distinct field, this reuses the same real text rather than
 * fabricating structure.
 */
function WhyThisResultFlow({ profile, scheme }: { profile: UserProfileInput | undefined; scheme: SchemeResult }) {
  const profileBits = profile
    ? [
        profile.age !== undefined ? `${profile.age} years` : null,
        profile.state,
        profile.occupation,
        profile.education,
        profile.familyIncome !== undefined ? `₹${profile.familyIncome.toLocaleString("en-IN")}/yr` : null,
        profile.category,
      ].filter(Boolean)
    : [];

  const steps = [
    { label: "Your profile", content: profileBits.length > 0 ? profileBits.join(" · ") : "No structured profile fields were provided." },
    { label: "Retrieved requirements", content: scheme.eligibilitySummary },
    { label: "Match reasoning", content: scheme.matchReason || "Not specified in available sources" },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700">
              {i + 1}
            </span>
            {i < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
          </div>
          <div className="pb-1">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{step.label}</div>
            <p className="mt-0.5 text-slate-700">{step.content}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-700">
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
