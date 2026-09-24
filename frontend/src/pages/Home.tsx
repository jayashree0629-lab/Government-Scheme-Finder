import { useState, type FormEvent } from "react";
import type { UserProfileInput } from "../types/scheme";
import { APP_TAGLINE, APP_SUBTEXT } from "../constants";
import { INDIAN_STATES, CATEGORIES, EXAMPLE_QUESTIONS } from "../data/formOptions";
import { HeroVisual } from "../components/HeroVisual";
import { ProcessFlow, type ProcessFlowStep } from "../components/ProcessFlow";
import { StateMessage } from "../components/StateMessage";
import { UserIcon, GlobeIcon, BuildingIcon, SparkleIcon, CheckCircleIcon, ArrowRightIcon } from "../components/icons";

interface HomeProps {
  onSubmit: (profile: UserProfileInput) => void;
  initialProfile?: UserProfileInput;
  error?: string | null;
}

const TRUST_ITEMS = [
  "Live government sources",
  "SerpApi search",
  "Gemini analysis",
  "Evidence-backed results",
  "Tamil Nadu + Central",
];

const FLOW_STEPS: ProcessFlowStep[] = [
  { number: 1, label: "Your profile", Icon: UserIcon },
  { number: 2, label: "Live web search", sublabel: "SerpApi", Icon: GlobeIcon },
  { number: 3, label: "Official evidence", sublabel: "Government sources", Icon: BuildingIcon },
  { number: 4, label: "AI reasoning", sublabel: "Gemini", Icon: SparkleIcon },
  { number: 5, label: "Personalized benefits", Icon: CheckCircleIcon },
];

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500";
const fieldLabelClass = "block text-sm font-semibold text-slate-700";

export function Home({ onSubmit, initialProfile, error }: HomeProps) {
  const [age, setAge] = useState(initialProfile?.age?.toString() ?? "");
  const [state, setState] = useState(initialProfile?.state ?? "Tamil Nadu");
  const [occupation, setOccupation] = useState(initialProfile?.occupation ?? "");
  const [education, setEducation] = useState(initialProfile?.education ?? "");
  const [familyIncome, setFamilyIncome] = useState(initialProfile?.familyIncome?.toString() ?? "");
  const [category, setCategory] = useState(initialProfile?.category ?? "");
  const [freeText, setFreeText] = useState(initialProfile?.freeText ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!freeText.trim() && !occupation.trim() && !education.trim() && !age) {
      setFormError("Add a few details — your age, occupation, education — or describe your situation above.");
      return;
    }
    setFormError(null);

    onSubmit({
      age: age ? Number(age) : undefined,
      state: state || undefined,
      occupation: occupation.trim() || undefined,
      education: education.trim() || undefined,
      familyIncome: familyIncome ? Number(familyIncome) : undefined,
      category: category || undefined,
      freeText: freeText.trim() || undefined,
    });
  }

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-navy-900">
        <div
          className="pointer-events-none absolute -top-40 right-0 h-[560px] w-[560px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-600) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-400) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.5fr)] gap-10 lg:gap-14 items-start">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-accent-300">
                Tamil Nadu + Central Government schemes
              </span>
              <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white text-balance leading-[1.05]">
                {APP_TAGLINE}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl">{APP_SUBTEXT}</p>

              {error && (
                <div className="mt-6 max-w-4xl">
                  <StateMessage tone="error" title="Something went wrong" body={error} />
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-8 rounded-2xl surface-glass border border-white/10 shadow-2xl shadow-black/40 p-6 sm:p-8 max-w-4xl"
              >
                <label htmlFor="freeText" className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Tell us about yourself
                </label>
                <div className="relative mt-2">
                  <textarea
                    id="freeText"
                    rows={5}
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="I'm a 21-year-old engineering student from Tamil Nadu…"
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 pr-16 text-lg leading-relaxed text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40 transition-shadow resize-none"
                  />
                  <button
                    type="submit"
                    aria-label="Find my benefits"
                    className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-white transition hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
                  >
                    <ArrowRightIcon className="h-4 w-4 -rotate-45" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {EXAMPLE_QUESTIONS.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setFreeText(example)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 transition max-w-full truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      title={example}
                    >
                      {example.length > 64 ? `${example.slice(0, 64)}…` : example}
                    </button>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Optional — helps narrow your results
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                    <div>
                      <label className={fieldLabelClass} htmlFor="age">
                        Age
                      </label>
                      <input
                        id="age"
                        type="number"
                        min={0}
                        max={120}
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={fieldClass}
                        placeholder="21"
                      />
                    </div>
                    <div>
                      <label className={fieldLabelClass} htmlFor="state">
                        State
                      </label>
                      <select id="state" value={state} onChange={(e) => setState(e.target.value)} className={fieldClass}>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={fieldLabelClass} htmlFor="occupation">
                        Occupation
                      </label>
                      <input
                        id="occupation"
                        type="text"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        className={fieldClass}
                        placeholder="Student, Farmer…"
                      />
                    </div>
                    <div>
                      <label className={fieldLabelClass} htmlFor="education">
                        Education
                      </label>
                      <input
                        id="education"
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className={fieldClass}
                        placeholder="Undergraduate"
                      />
                    </div>
                    <div>
                      <label className={fieldLabelClass} htmlFor="familyIncome">
                        Family income (₹/yr)
                      </label>
                      <input
                        id="familyIncome"
                        type="number"
                        min={0}
                        value={familyIncome}
                        onChange={(e) => setFamilyIncome(e.target.value)}
                        className={fieldClass}
                        placeholder="250000"
                      />
                    </div>
                    <div>
                      <label className={fieldLabelClass} htmlFor="category">
                        Category
                      </label>
                      <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
                        <option value="">Not specified</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="mt-4 text-base text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-accent-600 px-4 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-600/30 transition hover:bg-accent-700 hover:shadow-accent-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  Find My Benefits
                </button>
              </form>
            </div>

            <div className="flex justify-center lg:justify-end lg:pt-10">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Trust strip ---------- */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] sm:text-sm font-bold uppercase tracking-wider text-slate-500">
          {TRUST_ITEMS.map((item, i) => (
            <span key={item} className="flex items-center gap-x-6">
              {item}
              {i < TRUST_ITEMS.length - 1 && <span className="hidden sm:inline text-slate-300 ml-6">/</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="py-16 sm:py-24 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-600">How it works</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900 text-balance">
              From your situation to evidence-backed benefits
            </p>
          </div>
          <ProcessFlow steps={FLOW_STEPS} />
        </div>
      </section>
    </div>
  );
}
