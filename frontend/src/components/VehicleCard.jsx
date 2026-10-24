import { formatPrice } from '../utils/formatters';

export default function VehicleCard({
  vehicle,
  onPurchase,
  isPurchasing = false,
}) {
  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col justify-between">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
            {vehicle.category}
          </span>
          {isOutOfStock ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Out of stock
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              In stock: {vehicle.quantity}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {vehicle.make} {vehicle.model}
        </h3>

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Price</span>
            <span className="text-xl font-extrabold text-indigo-600">
              {formatPrice(vehicle.price)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase tracking-wider block">Available</span>
            <span className="text-sm font-semibold text-slate-700">
              {vehicle.quantity} {vehicle.quantity === 1 ? 'unit' : 'units'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto">
        <button
          type="button"
          onClick={() => onPurchase(vehicle.id)}
          disabled={isOutOfStock || isPurchasing}
          aria-label={
            isOutOfStock
              ? `Cannot purchase ${vehicle.make} ${vehicle.model}, out of stock`
              : `Purchase ${vehicle.make} ${vehicle.model} for ${formatPrice(vehicle.price)}`
          }
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : isPurchasing
              ? 'bg-indigo-400 text-white cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow cursor-pointer'
          }`}
        >
          {isOutOfStock ? 'Out of stock' : isPurchasing ? 'Purchasing...' : 'Purchase'}
        </button>
      </div>
    </div>
  );
}

