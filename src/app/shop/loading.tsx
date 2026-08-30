export default function ShopLoading() {
  return (
    <div className="animate-pulse bg-[#fbfcf8]" aria-label="Loading products" role="status">
      <div className="h-64 border-b border-[#dce8df] bg-[#f0f5eb]" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        <div className="hidden h-[500px] rounded-2xl bg-[#edf2ed] lg:block" />
        <div>
          <div className="mb-6 h-16 rounded-2xl bg-[#edf2ed]" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-[460px] rounded-3xl bg-[#edf2ed]" />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Loading product catalog</span>
    </div>
  );
}
