import type { Vehicle } from '../lib/types.js';
import { formatPrice } from '../lib/format.js';

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onDelete, onRestock }: Props) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {vehicle.category}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            outOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">{formatPrice(vehicle.priceCents)}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onPurchase(vehicle)}
          disabled={outOfStock}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? 'Unavailable' : 'Purchase'}
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => onRestock(vehicle)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              aria-label={`Restock ${vehicle.make} ${vehicle.model}`}
            >
              Restock
            </button>
            <button
              onClick={() => onEdit(vehicle)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(vehicle)}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
