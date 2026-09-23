import { ShieldIcon } from "./icons";
import { DISCLAIMER_TEXT } from "../constants";

export function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
      <ShieldIcon className="h-4 w-4 mt-0.5 text-slate-400" />
      <p>{DISCLAIMER_TEXT}</p>
    </div>
  );
}
