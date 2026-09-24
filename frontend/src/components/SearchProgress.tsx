import { useEffect, useState } from "react";
import { SearchIcon, UserIcon, GlobeIcon, SparkleIcon, ShieldIcon, CheckCircleIcon } from "./icons";

const STAGES = [
  { label: "Understanding your profile", Icon: UserIcon },
  { label: "Searching government sources with SerpApi", Icon: GlobeIcon },
  { label: "Analyzing eligibility with Gemini", Icon: SparkleIcon },
  { label: "Verifying evidence", Icon: ShieldIcon },
  { label: "Preparing results", Icon: CheckCircleIcon },
];

export function SearchProgress() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i < STAGES.length - 1 ? i + 1 : i));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20 text-center">
      <p role="status" aria-live="polite" className="sr-only">
        {STAGES[stepIndex].label}
      </p>

      {/* Animated node chain visual */}
      <div className="flex items-center justify-center">
        {STAGES.map((stage, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
          return (
            <div key={stage.label} className="flex items-center">
              <div className="relative flex flex-col items-center">
                {state === "active" && (
                  <span
                    className="absolute -inset-2 rounded-full motion-safe:animate-[glow-pulse_1.6s_ease-in-out_infinite]"
                    style={{
                      background:
                        "radial-gradient(circle, color-mix(in srgb, var(--color-accent-500) 55%, transparent) 0%, transparent 70%)",
                    }}
                  />
                )}
                <span
                  className={`relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                    state === "done"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                      : state === "active"
                        ? "border-accent-500 bg-navy-900 text-white"
                        : "border-slate-200 bg-white text-slate-300"
                  }`}
                >
                  <stage.Icon className="h-5 w-5 sm:h-7 sm:w-7" />
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <span
                  className={`h-px w-4 sm:w-10 transition-colors duration-500 ${
                    i < stepIndex ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <h1 className="mt-8 text-2xl font-semibold text-slate-900">{STAGES[stepIndex].label}…</h1>

      <ul className="mt-6 space-y-3 text-left max-w-md mx-auto">
        {STAGES.map((stage, i) => (
          <li
            key={stage.label}
            className={`flex items-center gap-3 text-base sm:text-lg transition-colors ${
              i <= stepIndex ? "text-slate-700" : "text-slate-300"
            }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                i < stepIndex
                  ? "bg-emerald-500 text-white"
                  : i === stepIndex
                    ? "bg-accent-600 text-white"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {i < stepIndex ? "✓" : ""}
            </span>
            {stage.label}
          </li>
        ))}
      </ul>

      <p className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
        <SearchIcon className="h-3.5 w-3.5" />
        Calling SerpApi and Gemini live — this can take up to a couple of minutes.
      </p>
    </div>
  );
}
