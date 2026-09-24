import { ShieldIcon } from "./icons";
import { DISCLAIMER_TEXT } from "../constants";

export function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-relaxed text-slate-600">
      <ShieldIcon className="h-5 w-5 mt-0.5 shrink-0 text-slate-400" />
      <p>{DISCLAIMER_TEXT}</p>
    </div>
  );
}
