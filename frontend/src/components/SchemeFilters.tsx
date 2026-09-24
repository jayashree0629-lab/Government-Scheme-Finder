import type { MatchStatus } from "../types/scheme";
import type { MatchCounts } from "../utils/sources";

export type SchemeFilterValue = "all" | MatchStatus;

interface SchemeFiltersProps {
  counts: MatchCounts;
  value: SchemeFilterValue;
  onChange: (value: SchemeFilterValue) => void;
}

export function SchemeFilters({ counts, value, onChange }: SchemeFiltersProps) {
  const tabs: { value: SchemeFilterValue; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.total },
    { value: "likely_eligible", label: "Likely", count: counts.likely },
    { value: "possibly_eligible", label: "Possibly", count: counts.possible },
    { value: "not_matching", label: "Doesn't match", count: counts.notMatching },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter schemes by eligibility status"
      className="inline-flex w-full sm:w-auto flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
    >
      {tabs.map((tab) => {
        const active = value === tab.value;
        const disabled = tab.count === 0 && tab.value !== "all";
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            disabled={disabled}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-base font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-slate-500"
            }`}
          >
            {tab.label}
            <span className={active ? "text-slate-400" : "text-slate-400"}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
