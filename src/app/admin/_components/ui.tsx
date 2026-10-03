import { DatabaseZap } from "lucide-react";

export function PageHeading({ title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">{title}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-neutral-500">{description}</p></div>
      {action}
    </div>
  );
}

export function DemoNotice({ localRecords = false }: { localRecords?: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <DatabaseZap className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p><strong>Development preview — database not connected.</strong> Changes are disabled. {localRecords ? "Records shown below are browser-local development records from this browser only; they are not shared, server-backed orders." : "The information shown is read-only seed data and will be replaced after PostgreSQL is configured."}</p>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><p className="font-bold text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{body}</p></div>;
}

export const panelClass = "rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_#0000000a]";
export const inputClass = "mt-1.5 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200 disabled:bg-slate-100 disabled:text-slate-500";
export const textareaClass = "mt-1.5 min-h-28 w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-neutral-600 focus:ring-2 focus:ring-neutral-200 disabled:bg-slate-100 disabled:text-slate-500";
export const buttonClass = "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-900 bg-[#303030] px-4 text-[13px] font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50";
