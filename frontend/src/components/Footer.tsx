import { DISCLAIMER_TEXT } from "../constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-xs text-slate-500 leading-relaxed">
        <p>{DISCLAIMER_TEXT}</p>
        <p className="mt-2">Built for the SerpApi India Hackathon 2026.</p>
      </div>
    </footer>
  );
}
