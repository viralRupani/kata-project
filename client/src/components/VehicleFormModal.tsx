import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehicleFormSchema, type VehicleFormValues } from '../lib/schemas.js';
import type { Vehicle } from '../lib/types.js';
import type { VehiclePayload } from '../lib/endpoints.js';

interface Props {
  vehicle: Vehicle | null; // null = create mode
  onClose: () => void;
  onSubmit: (payload: VehiclePayload) => Promise<void>;
}

const fieldClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

export function VehicleFormModal({ vehicle, onClose, onSubmit }: Props) {
  const isEdit = vehicle !== null;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: vehicle
      ? {
          make: vehicle.make,
          model: vehicle.model,
          category: vehicle.category,
          price: vehicle.priceCents / 100,
          quantity: vehicle.quantity,
        }
      : { make: '', model: '', category: '', price: 0, quantity: 0 },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      make: values.make,
      model: values.model,
      category: values.category,
      priceCents: Math.round(values.price * 100),
      quantity: values.quantity,
    });
  });

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">
          {isEdit ? 'Edit vehicle' : 'Add vehicle'}
        </h2>

        <form onSubmit={submit} className="mt-4 space-y-3">
          {(['make', 'model', 'category'] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="mb-1 block text-sm font-medium capitalize text-slate-700">
                {field}
              </label>
              <input id={field} className={fieldClass} {...register(field)} />
              {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]?.message}</p>}
            </div>
          ))}

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">
                Price (₹)
              </label>
              <input id="price" type="number" step="1" className={fieldClass} {...register('price')} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>
            <div className="flex-1">
              <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input id="quantity" type="number" className={fieldClass} {...register('quantity')} />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
