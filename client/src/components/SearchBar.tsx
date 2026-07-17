import { useState } from 'react';
import type { VehicleFilters } from '../lib/types.js';

interface Props {
  onSearch: (filters: VehicleFilters) => void;
  onReset: () => void;
}

const inputClass =
  'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';

/** Filter controls for make/model/category and a price range (in rupees). */
export function SearchBar({ onSearch, onReset }: Props) {
  const [make, setMake] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      make: make || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) * 100 : undefined,
      maxPrice: maxPrice ? Number(maxPrice) * 100 : undefined,
    });
  };

  const reset = () => {
    setMake('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onReset();
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <input
        aria-label="Make"
        placeholder="Make"
        value={make}
        onChange={(e) => setMake(e.target.value)}
        className={inputClass}
      />
      <input
        aria-label="Category"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className={inputClass}
      />
      <input
        aria-label="Min price"
        placeholder="Min ₹"
        type="number"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className={`${inputClass} w-24`}
      />
      <input
        aria-label="Max price"
        placeholder="Max ₹"
        type="number"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className={`${inputClass} w-24`}
      />
      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Search
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        Reset
      </button>
    </form>
  );
}
