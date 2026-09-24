import { DISCLAIMER_TEXT } from "../constants";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 mt-16">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white text-xs font-bold">
            SF
          </span>
          <span className="text-base font-semibold text-white">AI Government Scheme &amp; Benefits Finder</span>
        </div>
        <p className="mt-3 text-base text-slate-400 max-w-xl">
          Search live government sources. Understand your options. Verify before applying.
        </p>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-sm text-slate-500 leading-relaxed max-w-4xl">{DISCLAIMER_TEXT}</p>
          <p className="mt-2 text-sm text-slate-500">Built for the SerpApi India Hackathon 2026.</p>
        </div>
      </div>
    </footer>
  );
}
