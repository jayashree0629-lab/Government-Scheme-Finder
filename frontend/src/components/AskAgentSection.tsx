import { useId, useState } from "react";
import { ChatIcon, SendIcon } from "./icons";

const SUGGESTED_QUESTIONS = [
  "Which schemes can I apply for online?",
  "Which schemes need an income certificate?",
  "What documents should I prepare?",
];

/**
 * UI-only "prepared" surface for a future follow-up-question feature. There is currently no
 * backend endpoint to answer free-form questions about a result set (only POST /api/search
 * exists), so this deliberately does not fake a conversational AI response — submitting shows
 * an honest status message instead of invented text. Kept deliberately understated: it's a
 * preview of a future feature, not a primary call to action.
 */
export function AskAgentSection() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const statusId = useId();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setSubmitted(true);
  }

  return (
    <section aria-labelledby="ask-agent-heading" className="rounded-xl border border-dashed border-slate-200 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <ChatIcon className="h-3.5 w-3.5 text-slate-400" />
        <h2 id="ask-agent-heading" className="text-xs font-semibold text-slate-500">
          Have a question about these schemes?
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Coming soon
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="ask-agent-input" className="sr-only">
            Ask a question about your results
          </label>
          <input
            id="ask-agent-input"
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setSubmitted(false);
            }}
            placeholder="Ask about your results…"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            Ask
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setQuestion(q);
                setSubmitted(false);
              }}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-50 transition"
            >
              {q}
            </button>
          ))}
        </div>

        <p aria-live="polite" id={statusId} className="mt-2.5 text-xs text-slate-400">
          {submitted
            ? "Follow-up Q&A isn't connected yet — there's no backend endpoint for it. Refine your profile above and search again for more specific results."
            : "Prepared for a future release — not yet wired to a backend."}
        </p>
      </form>
    </section>
  );
}
