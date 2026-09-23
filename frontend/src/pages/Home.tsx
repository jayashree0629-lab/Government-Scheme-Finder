import { APP_TAGLINE } from "../constants";
import { SearchIcon, ChatIcon, ShieldIcon } from "../components/icons";

interface HomeProps {
  onStart: () => void;
}

const STEPS = [
  {
    title: "Tell us about you",
    body: "Fill a short profile, or just describe your situation in your own words.",
    Icon: ChatIcon,
  },
  {
    title: "We search live, official sources",
    body: "SerpApi runs targeted searches across gov.in, nic.in and Tamil Nadu government sites in real time.",
    Icon: SearchIcon,
  },
  {
    title: "Get evidence-backed results",
    body: "Gemini reads the retrieved pages and explains match status with sources — never invented data.",
    Icon: ShieldIcon,
  },
];

export function Home({ onStart }: HomeProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
        Tamil Nadu + Central Government schemes
      </span>
      <h1 className="mt-6 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 text-balance">
        {APP_TAGLINE}
      </h1>
      <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
        Describe yourself once. Our agent searches live government sources with SerpApi and Gemini AI, then
        returns scholarships, subsidies and welfare schemes that may apply — each one backed by a real
        source you can check yourself.
      </p>
      <button
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 transition"
      >
        Find schemes for me
      </button>

      <div className="mt-16 sm:mt-20">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">How it works</h2>
        <div className="mt-5 grid gap-6 sm:grid-cols-3 text-left">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <step.Icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-slate-400">Step {i + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
