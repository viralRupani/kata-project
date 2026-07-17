import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar.js';
import { SearchBar } from '../components/SearchBar.js';
import { VehicleCard } from '../components/VehicleCard.js';
import { VehicleFormModal } from '../components/VehicleFormModal.js';
import { useAuth } from '../context/AuthContext.js';
import { vehicleApi, type VehiclePayload } from '../lib/endpoints.js';
import { errorMessage } from '../lib/format.js';
import type { Vehicle, VehicleFilters } from '../lib/types.js';

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      setVehicles(await vehicleApi.list());
    } catch (err) {
      toast.error(errorMessage(err, 'Could not load vehicles'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleSearch = async (filters: VehicleFilters) => {
    try {
      setVehicles(await vehicleApi.search(filters));
    } catch (err) {
      toast.error(errorMessage(err, 'Search failed'));
    }
  };

  const handlePurchase = async (vehicle: Vehicle) => {
    try {
      const updated = await vehicleApi.purchase(vehicle.id, 1);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      toast.success(`Purchased ${updated.make} ${updated.model}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Purchase failed'));
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Delete ${vehicle.make} ${vehicle.model}?`)) return;
    try {
      await vehicleApi.remove(vehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      toast.success('Vehicle deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Delete failed'));
    }
  };

  const handleRestock = async (vehicle: Vehicle) => {
    const input = prompt(`Restock ${vehicle.make} ${vehicle.model} — how many units?`, '1');
    if (!input) return;
    const quantity = Number(input);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Enter a positive whole number');
      return;
    }
    try {
      const updated = await vehicleApi.restock(vehicle.id, quantity);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      toast.success(`Restocked to ${updated.quantity} units`);
    } catch (err) {
      toast.error(errorMessage(err, 'Restock failed'));
    }
  };

  const handleSaveVehicle = async (payload: VehiclePayload) => {
    try {
      if (editing) {
        const updated = await vehicleApi.update(editing.id, payload);
        setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        toast.success('Vehicle updated');
      } else {
        const created = await vehicleApi.create(payload);
        setVehicles((prev) => [created, ...prev]);
        toast.success('Vehicle added');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save vehicle'));
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
            <p className="text-sm text-slate-500">{vehicles.length} vehicles available</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              + Add vehicle
            </button>
          )}
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} onReset={loadAll} />
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-slate-400">Loading inventory…</p>
        ) : vehicles.length === 0 ? (
          <p className="py-16 text-center text-slate-400">No vehicles match your search.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={handlePurchase}
                onEdit={(v) => {
                  setEditing(v);
                  setModalOpen(true);
                }}
                onDelete={handleDelete}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <VehicleFormModal
          vehicle={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSaveVehicle}
        />
      )}
    </div>
  );
}
