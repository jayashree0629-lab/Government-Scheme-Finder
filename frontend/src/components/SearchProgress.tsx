import { useEffect, useState } from "react";
import { SearchIcon } from "./icons";

const STEPS = [
  "Understanding your profile",
  "Searching government sources with SerpApi",
  "Analyzing eligibility with Gemini",
  "Verifying evidence",
  "Preparing results",
];

export function SearchProgress() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24 text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
      </div>
      <h1 className="text-lg font-semibold text-slate-900">Searching live government sources…</h1>

      <ul className="mt-6 space-y-3 text-left">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={`flex items-center gap-3 text-sm transition-colors ${
              i <= stepIndex ? "text-slate-800" : "text-slate-300"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                i < stepIndex
                  ? "bg-emerald-500 text-white"
                  : i === stepIndex
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {i < stepIndex ? "✓" : i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>

      <p className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
        <SearchIcon className="h-3.5 w-3.5" />
        Calling SerpApi and Gemini live — this can take up to a couple of minutes.
      </p>
    </div>
  );
}
