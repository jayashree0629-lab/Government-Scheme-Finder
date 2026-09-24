import type { UserProfileInput } from "../types/scheme";

interface ProfileSummaryProps {
  profile: UserProfileInput | undefined;
  onEdit: () => void;
}

function formatIncome(income: number): string {
  if (income >= 100000) {
    const lakhs = income / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L income`;
  }
  return `₹${income.toLocaleString("en-IN")} income`;
}

export function ProfileSummary({ profile, onEdit }: ProfileSummaryProps) {
  if (!profile) return null;

  const items = [
    profile.age !== undefined ? `${profile.age} years` : null,
    profile.state ?? null,
    profile.occupation ?? null,
    profile.education ?? null,
    profile.familyIncome !== undefined ? formatIncome(profile.familyIncome) : null,
    profile.category ?? null,
  ].filter((v): v is string => Boolean(v));

  if (items.length === 0 && !profile.freeText) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base sm:text-lg text-slate-600">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          {i > 0 && <span className="text-slate-300">·</span>}
          <span className="font-medium text-slate-700">{item}</span>
        </span>
      ))}
      {profile.freeText && (
        <span className="flex items-center gap-2">
          {items.length > 0 && <span className="text-slate-300">·</span>}
          <span className="italic text-slate-500 max-w-xs truncate" title={profile.freeText}>
            “{profile.freeText}”
          </span>
        </span>
      )}
      <button
        type="button"
        onClick={onEdit}
        className="ml-1 text-sm font-semibold text-accent-600 hover:text-accent-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
      >
        Edit
      </button>
    </div>
  );
}
