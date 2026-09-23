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
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-24 text-center">
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
                  className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                    state === "done"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                      : state === "active"
                        ? "border-accent-500 bg-navy-900 text-white"
                        : "border-slate-200 bg-white text-slate-300"
                  }`}
                >
                  <stage.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <span
                  className={`h-px w-4 sm:w-8 transition-colors duration-500 ${
                    i < stepIndex ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <h1 className="mt-8 text-lg font-semibold text-slate-900">{STAGES[stepIndex].label}…</h1>

      <ul className="mt-6 space-y-2.5 text-left max-w-xs mx-auto">
        {STAGES.map((stage, i) => (
          <li
            key={stage.label}
            className={`flex items-center gap-3 text-sm transition-colors ${
              i <= stepIndex ? "text-slate-700" : "text-slate-300"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors ${
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

      <p className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
        <SearchIcon className="h-3.5 w-3.5" />
        Calling SerpApi and Gemini live — this can take up to a couple of minutes.
      </p>
    </div>
  );
}
