import { useState } from "react";
import type { SearchApiResponse } from "../types/scheme";
import { SchemeCard } from "../components/SchemeCard";
import { EligibilityBadge } from "../components/EligibilityBadge";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { StateMessage } from "../components/StateMessage";
import { ChevronDownIcon, SearchIcon } from "../components/icons";

interface ResultsProps {
  result: SearchApiResponse;
  onNewSearch: () => void;
}

export function Results({ result, onNewSearch }: ResultsProps) {
  const [showQueries, setShowQueries] = useState(false);
  const { queries, schemes, warnings, generatedAt } = result;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your results</h1>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <SearchIcon className="h-3.5 w-3.5 text-emerald-600" />
            Based on {queries.length} live SerpApi searches of official government sources · generated{" "}
            {new Date(generatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onNewSearch}
          className="shrink-0 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          New search
        </button>
      </div>

      {schemes.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs">
          <span className="font-semibold text-slate-500">What the badges mean:</span>
          <EligibilityBadge status="likely_eligible" />
          <EligibilityBadge status="possibly_eligible" />
          <EligibilityBadge status="not_matching" />
        </div>
      )}

      <div className="mt-5">
        <DisclaimerBanner />
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              {warning}
            </p>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-5">
        {schemes.length === 0 ? (
          <StateMessage
            tone="empty"
            title="No schemes could be confidently identified"
            body="Try adding more detail — your occupation, education level, or a specific question — and search again."
            action={
              <button
                onClick={onNewSearch}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Refine your search
              </button>
            }
          />
        ) : (
          schemes.map((scheme) => <SchemeCard key={`${scheme.schemeName}-${scheme.department}`} scheme={scheme} />)
        )}
      </div>

      <div className="mt-10 border-t border-slate-200 pt-5">
        <button
          onClick={() => setShowQueries((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
        >
          Technical details: {queries.length} search queries used
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showQueries ? "rotate-180" : ""}`} />
        </button>
        {showQueries && (
          <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 font-mono">
            {queries.map((q) => (
              <li key={q}>• {q}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
