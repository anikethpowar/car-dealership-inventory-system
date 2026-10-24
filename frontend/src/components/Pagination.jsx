export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  isLoading = false,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const fromIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(total, page * pageSize);

  const isPrevDisabled = page <= 1 || isLoading;
  const isNextDisabled = page >= totalPages || isLoading;

  if (total === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className="bg-white px-4 py-3 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
    >
      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{fromIndex}</span> to{' '}
        <span className="font-semibold text-slate-900">{toIndex}</span> of{' '}
        <span className="font-semibold text-slate-900">{total}</span> vehicles
        <span className="ml-2 text-slate-400">
          (Page {page} of {totalPages})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isPrevDisabled}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          &larr; Previous
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isNextDisabled}
          className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          Next &rarr;
        </button>
      </div>
    </nav>
  );
}

