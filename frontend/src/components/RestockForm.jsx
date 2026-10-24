import { useState } from 'react';
import MessageAlert from './MessageAlert';

export default function RestockForm({
  vehicle,
  isOpen = true,
  onClose,
  onRestock,
  isSubmitting = false,
}) {
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum <= 0 || !Number.isInteger(Number(quantity))) {
      setError('Restock quantity must be a positive whole number.');
      return;
    }

    try {
      await onRestock(vehicle.id, qtyNum);
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || JSON.stringify(d)).join(', '));
      } else {
        setError('Failed to restock vehicle. Please try again.');
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="restock-dialog-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 id="restock-dialog-title" className="text-lg font-bold text-slate-900">
              Restock Vehicle
            </h3>
            <p className="text-sm text-slate-500">
              {vehicle.make} {vehicle.model} (Currently in stock: {vehicle.quantity})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <MessageAlert type="error" message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="restock-quantity"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Additional Units to Add
            </label>
            <input
              id="restock-quantity"
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              New total stock will be {Math.max(0, vehicle.quantity) + (parseInt(quantity, 10) || 0)}.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Restocking...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

