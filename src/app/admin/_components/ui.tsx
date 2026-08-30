import { DatabaseZap } from "lucide-react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>{eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p></div>
      {action}
    </div>
  );
}

export function DemoNotice({ localRecords = false }: { localRecords?: boolean }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <DatabaseZap className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p><strong>Development preview — database not connected.</strong> Changes are disabled. {localRecords ? "Records shown below are browser-local development records from this browser only; they are not shared, server-backed orders." : "The information shown is read-only seed data and will be replaced after PostgreSQL is configured."}</p>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><p className="font-bold text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{body}</p></div>;
}

export const panelClass = "rounded-2xl border border-slate-200 bg-white shadow-sm";
export const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 disabled:bg-slate-100 disabled:text-slate-500";
export const textareaClass = "mt-1.5 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10 disabled:bg-slate-100 disabled:text-slate-500";
export const buttonClass = "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50";
