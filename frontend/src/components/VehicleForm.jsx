import { useState } from 'react';
import MessageAlert from './MessageAlert';

export default function VehicleForm({
  isOpen = true,
  vehicle = null,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const isEdit = Boolean(vehicle);

  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [category, setCategory] = useState(vehicle?.category || '');
  const [price, setPrice] = useState(vehicle?.price !== undefined ? String(vehicle.price) : '');
  const [quantity, setQuantity] = useState(
    vehicle?.quantity !== undefined ? String(vehicle.quantity) : '0'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedMake = make.trim();
    const trimmedModel = model.trim();
    const trimmedCategory = category.trim();

    if (!trimmedMake || !trimmedModel || !trimmedCategory) {
      setError('Make, Model, and Category are required and cannot be blank.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be a valid number greater than 0.');
      return;
    }

    const numQuantity = Number(quantity);
    if (
      isNaN(numQuantity) ||
      numQuantity < 0 ||
      !Number.isInteger(numQuantity) ||
      quantity === ''
    ) {
      setError('Quantity must be a whole number greater than or equal to 0.');
      return;
    }

    const payload = {
      make: trimmedMake,
      model: trimmedModel,
      category: trimmedCategory,
      price: numPrice,
      quantity: numQuantity,
    };

    try {
      await onSubmit(payload, isEdit, vehicle?.id);
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg || JSON.stringify(d)).join(', '));
      } else {
        setError(isEdit ? 'Failed to update vehicle.' : 'Failed to create vehicle.');
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-form-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 id="vehicle-form-title" className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <p className="text-sm text-slate-500">
              {isEdit
                ? 'Update the vehicle details below.'
                : 'Fill in the information to add a new vehicle to inventory.'}
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vehicle-make"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Make <span className="text-rose-500">*</span>
              </label>
              <input
                id="vehicle-make"
                type="text"
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="vehicle-model"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Model <span className="text-rose-500">*</span>
              </label>
              <input
                id="vehicle-model"
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. RAV4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="vehicle-category"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <input
              id="vehicle-category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. SUV, Sedan, Truck, Electric"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vehicle-price"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Price ($) <span className="text-rose-500">*</span>
              </label>
              <input
                id="vehicle-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 29999.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="vehicle-quantity"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Initial Stock <span className="text-rose-500">*</span>
              </label>
              <input
                id="vehicle-quantity"
                type="number"
                min="0"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              {isSubmitting
                ? isEdit
                  ? 'Saving changes...'
                  : 'Adding vehicle...'
                : isEdit
                ? 'Save Changes'
                : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

