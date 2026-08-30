export default function Loading() {
  return <div className="site-shell py-16" aria-live="polite" aria-label="Loading content"><div className="h-4 w-28 animate-pulse rounded-full bg-[#dce8df]" /><div className="mt-5 h-12 max-w-xl animate-pulse rounded-2xl bg-[#e5eee7]" /><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-96 animate-pulse rounded-3xl border border-[#e1eae3] bg-white" />)}</div></div>;
}
