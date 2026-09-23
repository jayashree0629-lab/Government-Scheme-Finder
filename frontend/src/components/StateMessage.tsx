import type { ReactNode } from "react";
import { AlertIcon, InboxIcon } from "./icons";

interface StateMessageProps {
  tone: "empty" | "error";
  title: string;
  body: string;
  action?: ReactNode;
}

export function StateMessage({ tone, title, body, action }: StateMessageProps) {
  const isError = tone === "error";
  const Icon = isError ? AlertIcon : InboxIcon;

  return (
    <div
      className={`rounded-xl border p-6 sm:p-8 text-center ${
        isError ? "border-red-200 bg-red-50" : "border-dashed border-slate-300 bg-slate-50"
      }`}
    >
      <div
        className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
          isError ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-500"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className={`mt-3 text-sm font-semibold ${isError ? "text-red-800" : "text-slate-800"}`}>{title}</h3>
      <p className={`mt-1.5 text-sm ${isError ? "text-red-700" : "text-slate-500"} max-w-sm mx-auto`}>{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
