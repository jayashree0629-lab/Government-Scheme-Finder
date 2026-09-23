import type { MatchStatus } from "../types/scheme";
import { CheckCircleIcon, QuestionCircleIcon, XCircleIcon } from "./icons";

const STYLES: Record<MatchStatus, { label: string; className: string; Icon: typeof CheckCircleIcon }> = {
  likely_eligible: {
    label: "Likely Eligible",
    className: "bg-emerald-50 text-emerald-700 border-emerald-300",
    Icon: CheckCircleIcon,
  },
  possibly_eligible: {
    label: "Possibly Eligible",
    className: "bg-amber-50 text-amber-800 border-amber-300",
    Icon: QuestionCircleIcon,
  },
  not_matching: {
    label: "Doesn't Match",
    className: "bg-slate-100 text-slate-600 border-slate-300",
    Icon: XCircleIcon,
  },
};

export function EligibilityBadge({ status }: { status: MatchStatus }) {
  const { label, className, Icon } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
