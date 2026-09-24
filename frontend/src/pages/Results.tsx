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
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        {/* ---- Page header ---- */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">Your benefits landscape</h1>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl">
              Based on the information you provided, we found these government schemes worth reviewing.
            </p>
          </div>
          <button
            onClick={onNewSearch}
            className="shrink-0 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-base font-semibold text-slate-700 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            New search
          </button>
        </div>

        <div className="mt-5">
          <ProfileSummary profile={profile} onEdit={onNewSearch} />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Based on {queries.length} live SerpApi searches of official government sources · generated{" "}
          {new Date(generatedAt).toLocaleString()}
        </p>

        {warnings.length > 0 && (
          <div className="mt-5 space-y-2">
            {warnings.map((warning) => (
              <p
                key={warning}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-800"
              >
                {warning}
              </p>
            ))}
          </div>
        )}

        {/* ---- Main: large scheme cards + sticky summary sidebar ---- */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
          <div className="min-w-0 space-y-6">
            {schemes.length > 0 && <SchemeFilters counts={counts} value={filter} onChange={setFilter} />}

            {schemes.length === 0 ? (
              <StateMessage
                tone="empty"
                title="No schemes could be confidently identified"
                body="Try adding more detail — your occupation, education level, or a specific question — and search again."
                action={
                  <button
                    onClick={onNewSearch}
                    className="rounded-lg bg-accent-600 px-5 py-2.5 text-base font-medium text-white hover:bg-accent-700 transition"
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

          <aside className="order-first space-y-5 lg:order-last lg:sticky lg:top-24">
            {schemes.length > 0 && <BenefitMatchSummary schemes={schemes} profile={profile} />}
            <DisclaimerBanner />
          </aside>
        </div>

        {schemes.length > 0 && (
          <div className="mt-10 max-w-3xl">
            <AskAgentSection />
          </div>
        )}

        <div className="mt-10 border-t border-slate-200 pt-5">
          <button
            onClick={() => setShowQueries((v) => !v)}
            aria-expanded={showQueries}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
          >
            Technical details: {queries.length} search queries used
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showQueries ? "rotate-180" : ""}`} />
          </button>
          {showQueries && (
            <ul className="mt-2 space-y-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 font-mono">
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
