import { useMemo, useState } from "react";
import type { SearchApiResponse, UserProfileInput } from "../types/scheme";
import { SchemeCard } from "../components/SchemeCard";
import { BenefitMatchSummary } from "../components/BenefitMatchSummary";
import { ProfileSummary } from "../components/ProfileSummary";
import { SchemeFilters, type SchemeFilterValue } from "../components/SchemeFilters";
import { AskAgentSection } from "../components/AskAgentSection";
import { DisclaimerBanner } from "../components/DisclaimerBanner";
import { StateMessage } from "../components/StateMessage";
import { ChevronDownIcon } from "../components/icons";
import { computeMatchCounts } from "../utils/sources";

interface ResultsProps {
  result: SearchApiResponse;
  profile: UserProfileInput | undefined;
  onNewSearch: () => void;
}

export function Results({ result, profile, onNewSearch }: ResultsProps) {
  const [showQueries, setShowQueries] = useState(false);
  const [filter, setFilter] = useState<SchemeFilterValue>("all");
  const { queries, schemes, warnings, generatedAt } = result;

  const counts = useMemo(() => computeMatchCounts(schemes), [schemes]);
  const filteredSchemes = useMemo(
    () => (filter === "all" ? schemes : schemes.filter((s) => s.matchStatus === filter)),
    [schemes, filter],
  );

  return (
    <div className="bg-[var(--color-paper-dim)] min-h-full">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">Your benefits landscape</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Based on the information you provided, we found these government schemes worth reviewing.
            </p>
          </div>
          <button
            onClick={onNewSearch}
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            New search
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Based on {queries.length} live SerpApi searches of official government sources · generated{" "}
          {new Date(generatedAt).toLocaleString()}
        </p>

        <div className="mt-4">
          <ProfileSummary profile={profile} onEdit={onNewSearch} />
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

        {schemes.length > 0 && (
          <div className="mt-6">
            <BenefitMatchSummary schemes={schemes} profile={profile} />
          </div>
        )}

        <div className="mt-5">
          <DisclaimerBanner />
        </div>

        {schemes.length > 0 && (
          <div className="mt-7">
            <SchemeFilters counts={counts} value={filter} onChange={setFilter} />
          </div>
        )}

        <div className="mt-5 space-y-5">
          {schemes.length === 0 ? (
            <StateMessage
              tone="empty"
              title="No schemes could be confidently identified"
              body="Try adding more detail — your occupation, education level, or a specific question — and search again."
              action={
                <button
                  onClick={onNewSearch}
                  className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 transition"
                >
                  Refine your search
                </button>
              }
            />
          ) : filteredSchemes.length === 0 ? (
            <StateMessage
              tone="empty"
              title="No schemes match this filter"
              body="Try a different filter above to see the rest of your results."
            />
          ) : (
            filteredSchemes.map((scheme) => (
              <SchemeCard key={`${scheme.schemeName}-${scheme.department}`} scheme={scheme} profile={profile} />
            ))
          )}
        </div>

        {schemes.length > 0 && (
          <div className="mt-8">
            <AskAgentSection />
          </div>
        )}

        <div className="mt-10 border-t border-slate-200 pt-5">
          <button
            onClick={() => setShowQueries((v) => !v)}
            aria-expanded={showQueries}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
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
    </div>
  );
}
