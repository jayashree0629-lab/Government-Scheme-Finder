import type { ComponentType } from "react";
import { ArrowDownIcon, ArrowRightIcon } from "./icons";

export interface ProcessFlowStep {
  number: number;
  label: string;
  sublabel?: string;
  Icon: ComponentType<{ className?: string }>;
}

/**
 * "How it works" architecture visualization — a horizontal connected chain on wider
 * screens (a product-architecture feel), collapsing to a vertical stack on mobile.
 */
export function ProcessFlow({ steps }: { steps: ProcessFlowStep[] }) {
  return (
    <>
      {/* Mobile: vertical stack */}
      <div className="flex flex-col items-center sm:hidden">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center w-full">
            <FlowNode step={step} />
            {i < steps.length - 1 && <ArrowDownIcon className="h-5 w-5 my-2 text-slate-300" />}
          </div>
        ))}
      </div>

      {/* Desktop/tablet: horizontal chain */}
      <div className="hidden sm:flex items-start justify-between gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-start flex-1">
            <FlowNode step={step} />
            {i < steps.length - 1 && (
              <ArrowRightIcon className="h-5 w-5 mt-10 mx-1 shrink-0 text-slate-300" />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function FlowNode({ step }: { step: ProcessFlowStep }) {
  return (
    <div className="group flex flex-col items-center text-center w-full sm:w-auto px-1">
      <div className="relative">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-accent-600 shadow-sm transition-all duration-300 group-hover:border-accent-400 group-hover:shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-accent-500)_10%,transparent)]"
        >
          <step.Icon className="h-7 w-7" />
        </span>
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
          {step.number}
        </span>
      </div>
      <div className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-900">{step.label}</div>
      {step.sublabel && <div className="mt-1 text-sm text-slate-500">{step.sublabel}</div>}
    </div>
  );
}
