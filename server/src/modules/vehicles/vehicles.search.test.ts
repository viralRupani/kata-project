import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, authHeaderFor } from '../../tests/helpers.js';
import { prisma } from '../../lib/prisma.js';

const app = createApp();

const seedVehicles = () =>
  prisma.vehicle.createMany({
    data: [
      { make: 'Toyota', model: 'Corolla', category: 'Sedan', priceCents: 2000000, quantity: 3 },
      { make: 'Toyota', model: 'Camry', category: 'Sedan', priceCents: 3000000, quantity: 2 },
      { make: 'Ford', model: 'Mustang', category: 'Coupe', priceCents: 4500000, quantity: 1 },
    ],
  });

describe('GET /api/vehicles/search', () => {
  let auth: Record<string, string>;

  beforeEach(async () => {
    await resetDb();
    auth = await authHeaderFor('USER');
    await seedVehicles();
  });

  it('is resolved as its own route, not as /:id', async () => {
    const res = await request(app).get('/api/vehicles/search').set(auth);
    expect(res.status).toBe(200); // would be 404 (vehicle "search") if mis-routed
  });

  it('filters by make (case-insensitive, partial)', async () => {
    const res = await request(app).get('/api/vehicles/search?make=toyo').set(auth);
    expect(res.body.vehicles).toHaveLength(2);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/vehicles/search?category=Coupe').set(auth);
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].model).toBe('Mustang');
  });

  it('filters by an inclusive price range (boundaries included)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=2000000&maxPrice=3000000')
      .set(auth);
    const prices = res.body.vehicles.map((v: { priceCents: number }) => v.priceCents).sort();
    expect(prices).toEqual([2000000, 3000000]); // both boundaries present
  });

  it('combines filters (make + max price)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota&maxPrice=2500000')
      .set(auth);
    expect(res.body.vehicles).toHaveLength(1);
    expect(res.body.vehicles[0].model).toBe('Corolla');
  });

  it('rejects an inverted price range with 400', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=5000000&maxPrice=1000000')
      .set(auth);
    expect(res.status).toBe(400);
  });
});
