import type { ReactNode } from "react";

export function CommerceShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[65vh] bg-slate-50/70 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-3xl">
          {eyebrow ? (
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 text-base leading-7 text-slate-600">{description}</p> : null}
        </header>
        {children}
      </div>
    </div>
  );
}
