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
    <section aria-label="Your benefit landscape" className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-accent-600">Your benefit landscape</h2>

      <div className="mt-4 flex items-end gap-3">
        <div className="text-6xl font-bold leading-none tracking-tight text-slate-900">{counts.total}</div>
        <div className="pb-1 text-base text-slate-600">scheme{counts.total === 1 ? "" : "s"} found</div>
      </div>

      {counts.total > 0 && (
        <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(counts.likely / total) * 100}%` }} />
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${(counts.possible / total) * 100}%` }} />
          <div className="h-full bg-slate-400 transition-all" style={{ width: `${(counts.notMatching / total) * 100}%` }} />
        </div>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat value={counts.likely} label="Likely" dot="bg-emerald-500" />
        <Stat value={counts.possible} label="Possible" dot="bg-amber-500" />
        <Stat value={counts.notMatching} label="Doesn't match" dot="bg-slate-400" />
      </div>

      {(coverage.hasCentral || coverage.hasState) && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Search coverage</h3>
          <ul className="mt-3 space-y-2 text-base text-slate-700">
            <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <BuildingIcon className="h-4 w-4 text-slate-400" />
              Central Government
              {coverage.hasCentral ? (
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className="text-sm text-slate-400">— no sources found</span>
              )}
            </li>
            {coverage.stateName && (
              <li className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <BuildingIcon className="h-4 w-4 text-slate-400" />
                {coverage.stateName} Government
                {coverage.hasState ? (
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="text-sm text-slate-400">— no sources found</span>
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ value, label, dot }: { value: number; label: string; dot: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-2.5 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="text-3xl font-bold leading-none text-slate-900">{value}</span>
      </div>
      <div className="mt-1.5 text-[13px] leading-tight text-slate-600">{label}</div>
    </div>
  );
}
