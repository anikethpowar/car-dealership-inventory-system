import { useState } from 'react';

export default function VehicleFilters({
  initialFilters = {},
  onApplyFilters,
  onClearFilters,
  isLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [make, setMake] = useState(initialFilters.make || '');
  const [model, setModel] = useState(initialFilters.model || '');
  const [category, setCategory] = useState(initialFilters.category || '');
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
  const [inStockOnly, setInStockOnly] = useState(Boolean(initialFilters.inStockOnly));

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters({
      searchQuery: searchQuery.trim(),
      make: make.trim(),
      model: model.trim(),
      category: category.trim(),
      minPrice: minPrice !== '' ? Number(minPrice) : '',
      maxPrice: maxPrice !== '' ? Number(maxPrice) : '',
      inStockOnly,
    });
  };

  const handleClear = () => {
    setSearchQuery('');
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    onClearFilters();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
    >
      {/* Search Input */}
      <div>
        <label
          htmlFor="filter-search"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Quick Search
        </label>
        <div className="relative">
          <input
            id="filter-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by make, model, or category..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {searchQuery.trim() && (
          <p className="text-xs text-indigo-600 mt-1">
            Using keyword search. Other specific attribute filters are bypassed while keyword search is active.
          </p>
        )}
      </div>

      {/* Structured Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
        <div>
          <label
            htmlFor="filter-make"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Make
          </label>
          <input
            id="filter-make"
            type="text"
            disabled={Boolean(searchQuery.trim())}
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="e.g. Toyota"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="filter-model"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Model
          </label>
          <input
            id="filter-model"
            type="text"
            disabled={Boolean(searchQuery.trim())}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. Camry"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="filter-category"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Category
          </label>
          <input
            id="filter-category"
            type="text"
            disabled={Boolean(searchQuery.trim())}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Sedan"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="filter-min-price"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Min Price ($)
          </label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            step="any"
            disabled={Boolean(searchQuery.trim())}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="filter-max-price"
            className="block text-xs font-medium text-slate-600 mb-1"
          >
            Max Price ($)
          </label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            step="any"
            disabled={Boolean(searchQuery.trim())}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="100000"
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Stock Checkbox & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center">
          <input
            id="filter-in-stock"
            type="checkbox"
            disabled={Boolean(searchQuery.trim())}
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
          />
          <label
            htmlFor="filter-in-stock"
            className="ml-2 block text-sm text-slate-700 cursor-pointer"
          >
            In-stock only
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
          >
            Clear filters
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Applying...' : 'Apply filters'}
          </button>
        </div>
      </div>
    </form>
  );
}

