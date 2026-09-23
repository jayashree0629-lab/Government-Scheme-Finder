import { useState } from "react";
import type { SchemeResult } from "../types/scheme";
import { EligibilityBadge } from "./EligibilityBadge";
import { BuildingIcon, CalendarIcon, ChevronDownIcon, DocumentIcon, LinkArrowIcon, SourceIcon } from "./icons";

function isOfficialUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith(".gov.in") || host.endsWith(".nic.in") || host === "myscheme.gov.in";
  } catch {
    return false;
  }
}

export function SchemeCard({ scheme }: { scheme: SchemeResult }) {
  const [showSources, setShowSources] = useState(false);
  const officialSourceCount = scheme.sources.filter((s) => isOfficialUrl(s.url)).length;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">{scheme.schemeName}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <BuildingIcon className="h-3.5 w-3.5 shrink-0" />
            {scheme.department}
          </p>
        </div>
        <EligibilityBadge status={scheme.matchStatus} />
      </div>

      {scheme.matchReason && (
        <div className="mt-3 rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
          <span className="font-semibold text-slate-500">Why: </span>
          {scheme.matchReason}
        </div>
      )}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Eligibility</dt>
          <dd className="mt-1 text-sm text-slate-700">{scheme.eligibilitySummary}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Benefits</dt>
          <dd className="mt-1 text-sm text-slate-700">{scheme.benefits}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <DocumentIcon className="h-3.5 w-3.5" />
            Required documents
          </dt>
          <dd className="mt-1 text-sm text-slate-700">
            {scheme.requiredDocuments.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5">
                {scheme.requiredDocuments.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-400">Not specified in available sources</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <CalendarIcon className="h-3.5 w-3.5" />
            Deadline
          </dt>
          <dd className="mt-1 text-sm text-slate-700">
            {scheme.deadline ?? <span className="text-slate-400">Not specified — check official portal</span>}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        {scheme.applicationLink && (
          <a
            href={scheme.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            Official application link
            <LinkArrowIcon className="h-3.5 w-3.5" />
          </a>
        )}
        <button
          onClick={() => setShowSources((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <SourceIcon className="h-3.5 w-3.5" />
          {scheme.sources.length} source{scheme.sources.length === 1 ? "" : "s"}
          {officialSourceCount > 0 && (
            <span className="text-emerald-600">
              ({officialSourceCount} official)
            </span>
          )}
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showSources ? "rotate-180" : ""}`} />
        </button>
      </div>

      {showSources && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {scheme.sources.map((source) => (
            <div key={source.url} className="text-xs text-slate-500">
              <div className="flex items-center gap-1.5 flex-wrap">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline break-all"
                >
                  {source.url}
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
      )}
    </article>
  );
}
