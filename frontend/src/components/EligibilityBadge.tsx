import type { MatchStatus } from "../types/scheme";

const STYLES: Record<MatchStatus, { label: string; dot: string; text: string; pill: string }> = {
  likely_eligible: {
    label: "Likely Eligible",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    pill: "bg-emerald-50 border-emerald-200",
  },
  possibly_eligible: {
    label: "Possibly Eligible",
    dot: "bg-amber-500",
    text: "text-amber-800",
    pill: "bg-amber-50 border-amber-200",
  },
  not_matching: {
    label: "Doesn't Match",
    dot: "bg-slate-400",
    text: "text-slate-600",
    pill: "bg-slate-100 border-slate-200",
  },
};

interface EligibilityBadgeProps {
  status: MatchStatus;
  size?: "sm" | "md" | "lg";
}

/**
 * Status label: a colored dot + uppercase text. The "lg" size adds a tinted pill so the
 * eligibility status is one of the first things read on a scheme card.
 */
export function EligibilityBadge({ status, size = "sm" }: EligibilityBadgeProps) {
  const { label, dot, text, pill } = STYLES[status];

  if (size === "lg") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide ${pill} ${text}`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {label}
      </span>
    );
  }

  const textSize = size === "md" ? "text-xs" : "text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wide ${textSize} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
