import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCard } from './VehicleCard.js';
import type { Vehicle } from '../lib/types.js';

const baseVehicle: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  priceCents: 2200000,
  quantity: 3,
  createdAt: '',
  updatedAt: '',
};

const noop = () => {};

const renderCard = (overrides: Partial<Vehicle> = {}, isAdmin = false, onPurchase = noop) =>
  render(
    <VehicleCard
      vehicle={{ ...baseVehicle, ...overrides }}
      isAdmin={isAdmin}
      onPurchase={onPurchase}
      onEdit={noop}
      onDelete={noop}
      onRestock={noop}
    />,
  );

describe('VehicleCard', () => {
  it('shows the vehicle details and formatted price', () => {
    renderCard();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('3 in stock')).toBeInTheDocument();
  });

  it('enables Purchase and fires the handler when in stock', async () => {
    const onPurchase = vi.fn();
    renderCard({ quantity: 2 }, false, onPurchase);
    const btn = screen.getByRole('button', { name: 'Purchase' });
    expect(btn).toBeEnabled();
    await userEvent.click(btn);
    expect(onPurchase).toHaveBeenCalledTimes(1);
  });

  it('disables the Purchase button when quantity is zero', () => {
    renderCard({ quantity: 0 });
    expect(screen.getByRole('button', { name: 'Unavailable' })).toBeDisabled();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('hides admin controls for a non-admin user', () => {
    renderCard({}, false);
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows admin controls for an admin user', () => {
    renderCard({}, true);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restock/i })).toBeInTheDocument();
  });
});
