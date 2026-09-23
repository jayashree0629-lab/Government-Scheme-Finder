import { useId, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "./icons";

interface DisclosureProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Disclosure({ label, defaultOpen = false, children }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border-t border-slate-100 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-2 py-3 text-left text-sm font-medium text-slate-700 hover:text-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 rounded"
      >
        {label}
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div id={panelId} className="pb-4 text-sm text-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}
