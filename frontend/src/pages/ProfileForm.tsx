import { useState, type FormEvent } from "react";
import type { UserProfileInput } from "../types/scheme";
import { BuildingIcon, ChatIcon } from "../components/icons";

interface ProfileFormProps {
  initialProfile?: UserProfileInput;
  onSubmit: (profile: UserProfileInput) => void;
  onBack: () => void;
}

const INDIAN_STATES = [
  "Tamil Nadu",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Other / Not listed",
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS", "Other / Prefer not to say"];

const EXAMPLE_QUESTIONS = [
  "I'm a 21-year-old engineering student in Tamil Nadu, family income ₹2.5 lakh — what scholarships can I get?",
  "I run a small tailoring business in Madurai. What subsidies could help me?",
  "I'm a senior citizen with no pension. What welfare schemes am I eligible for?",
];

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";
const labelClass = "block text-sm font-medium text-slate-700";

export function ProfileForm({ initialProfile, onSubmit, onBack }: ProfileFormProps) {
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
      setFormError("Please fill in at least a few profile fields, or describe your situation below.");
      return;
    }
    setFormError(null);

    const profile: UserProfileInput = {
      age: age ? Number(age) : undefined,
      state: state || undefined,
      occupation: occupation.trim() || undefined,
      education: education.trim() || undefined,
      familyIncome: familyIncome ? Number(familyIncome) : undefined,
      category: category || undefined,
      freeText: freeText.trim() || undefined,
    };

    onSubmit(profile);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 transition">
        ← Back
      </button>
      <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">Tell us about yourself</h1>
      <p className="mt-2 text-sm text-slate-600">
        Every field below is optional. The more detail you give, the more targeted the live government
        search will be — but you can also just describe your situation in the box at the bottom.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2 text-slate-800">
            <BuildingIcon className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold">Your profile</h2>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="age">
                Age
              </label>
              <input
                id="age"
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
                placeholder="e.g. 21"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="state">
                State
              </label>
              <select id="state" value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="occupation">
                Occupation
              </label>
              <input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className={inputClass}
                placeholder="e.g. Student, Farmer, Self-employed"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="education">
                Education
              </label>
              <input
                id="education"
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className={inputClass}
                placeholder="e.g. Engineering undergraduate"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="familyIncome">
                Annual family income (₹)
              </label>
              <input
                id="familyIncome"
                type="number"
                min={0}
                value={familyIncome}
                onChange={(e) => setFamilyIncome(e.target.value)}
                className={inputClass}
                placeholder="e.g. 250000"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="category">
                Category
              </label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <option value="">Not specified</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <section className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-slate-800">
            <ChatIcon className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold">Ask in your own words</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            You don't need to know any scheme's name — just describe your situation or ask a question.
          </p>
          <textarea
            id="freeText"
            rows={3}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            className={`${inputClass} mt-3`}
            placeholder='e.g. "I run a small tailoring business in Madurai, what subsidies could help me?"'
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setFreeText(example)}
                className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100 transition max-w-full truncate"
                title={example}
              >
                {example.length > 46 ? `${example.slice(0, 46)}…` : example}
              </button>
            ))}
          </div>
        </section>

        {formError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Search live government sources
        </button>
      </form>
    </div>
  );
}
