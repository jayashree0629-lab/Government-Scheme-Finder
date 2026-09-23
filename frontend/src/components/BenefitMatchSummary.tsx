import type { SchemeResult, UserProfileInput } from "../types/scheme";
import { computeMatchCounts, computeSourceCoverage } from "../utils/sources";
import { CheckCircleIcon, BuildingIcon } from "./icons";

interface BenefitMatchSummaryProps {
  schemes: SchemeResult[];
  profile: UserProfileInput | undefined;
}

export function BenefitMatchSummary({ schemes, profile }: BenefitMatchSummaryProps) {
  const counts = computeMatchCounts(schemes);
  const coverage = computeSourceCoverage(schemes, profile);
  const total = counts.total || 1; // guard divide-by-zero for the bar widths only

  return (
    <section
      aria-label="Your benefit landscape"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 className="text-xs font-bold uppercase tracking-wide text-accent-600">Your benefit landscape</h2>

      <div className="mt-4 flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <div className="text-5xl font-bold tracking-tight text-slate-900">{counts.total}</div>
          <div className="mt-1 text-sm text-slate-500">scheme{counts.total === 1 ? "" : "s"} found</div>
        </div>

        <div className="flex gap-8 sm:gap-10">
          <Stat value={counts.likely} label="Likely" dot="bg-emerald-500" />
          <Stat value={counts.possible} label="Possible" dot="bg-amber-500" />
          <Stat value={counts.notMatching} label="Doesn't match" dot="bg-slate-400" />
        </div>
      </div>

      {counts.total > 0 && (
        <div className="mt-5 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(counts.likely / total) * 100}%` }} />
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${(counts.possible / total) * 100}%` }} />
          <div className="h-full bg-slate-400 transition-all" style={{ width: `${(counts.notMatching / total) * 100}%` }} />
        </div>
      )}

      {(coverage.hasCentral || coverage.hasState) && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Search coverage</h3>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <BuildingIcon className="h-3.5 w-3.5 text-slate-400" />
              Central Government
              {coverage.hasCentral ? (
                <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <span className="text-xs text-slate-400">— no sources found</span>
              )}
            </span>
            {coverage.stateName && (
              <span className="inline-flex items-center gap-1.5">
                <BuildingIcon className="h-3.5 w-3.5 text-slate-400" />
                {coverage.stateName} Government
                {coverage.hasState ? (
                  <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <span className="text-xs text-slate-400">— no sources found</span>
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ value, label, dot }: { value: number; label: string; dot: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-2xl font-bold leading-none text-slate-900">{value}</span>
      </div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}
