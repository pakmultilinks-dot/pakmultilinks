export default function ProductLoading() {
  return (
    <div className="animate-pulse bg-[#fbfcf8] px-4 py-10" role="status" aria-label="Loading product">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 h-5 w-72 rounded bg-[#e7eee8]" />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-[#edf2ed]" />
          <div className="py-4">
            <div className="h-7 w-32 rounded-full bg-[#e7eee8]" />
            <div className="mt-5 h-12 w-4/5 rounded bg-[#e7eee8]" />
            <div className="mt-4 h-6 w-full rounded bg-[#e7eee8]" />
            <div className="mt-10 h-72 rounded-3xl bg-[#edf2ed]" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product details</span>
    </div>
  );
}
