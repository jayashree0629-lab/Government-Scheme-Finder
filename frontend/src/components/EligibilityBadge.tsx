import type { MatchStatus } from "../types/scheme";

const STYLES: Record<MatchStatus, { label: string; dot: string; text: string }> = {
  likely_eligible: {
    label: "Likely Eligible",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  possibly_eligible: {
    label: "Possibly Eligible",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
  not_matching: {
    label: "Doesn't Match",
    dot: "bg-slate-400",
    text: "text-slate-500",
  },
};

interface EligibilityBadgeProps {
  status: MatchStatus;
  size?: "sm" | "md";
}

/**
 * A restrained status label — a colored dot + uppercase text — rather than a heavy
 * bordered pill, so eligibility status reads as editorial metadata, not a UI chrome element.
 */
export function EligibilityBadge({ status, size = "sm" }: EligibilityBadgeProps) {
  const { label, dot, text } = STYLES[status];
  const textSize = size === "md" ? "text-xs" : "text-[11px]";

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wide ${textSize} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
