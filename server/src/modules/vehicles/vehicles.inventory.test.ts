import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, authHeaderFor } from '../../tests/helpers.js';
import { prisma } from '../../lib/prisma.js';

const app = createApp();

const makeVehicle = (quantity: number) =>
  prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', priceCents: 2000000, quantity },
  });

describe('POST /api/vehicles/:id/purchase', () => {
  beforeEach(resetDb);

  it('decrements stock by 1 by default', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle(3);

    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(2);
  });

  it('decrements by the requested quantity', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle(5);

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set(auth)
      .send({ quantity: 3 });
    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(2);
  });

  it('rejects a purchase when out of stock with 409 and leaves stock at 0', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle(0);

    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`).set(auth);
    expect(res.status).toBe(409);
    const after = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(after?.quantity).toBe(0);
  });

  it('rejects buying more than the available stock (409, unchanged)', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle(2);

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set(auth)
      .send({ quantity: 3 });
    expect(res.status).toBe(409);
    const after = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(after?.quantity).toBe(2);
  });

  it('never oversells under concurrent purchases (no negative stock)', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle(5);

    // Fire 10 concurrent single-unit purchases against 5 units of stock.
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app).post(`/api/vehicles/${vehicle.id}/purchase`).set(auth),
      ),
    );

    const ok = results.filter((r) => r.status === 200).length;
    const conflict = results.filter((r) => r.status === 409).length;
    expect(ok).toBe(5); // exactly the available units sold
    expect(conflict).toBe(5);

    const after = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(after?.quantity).toBe(0); // never negative
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const auth = await authHeaderFor('USER');
    const res = await request(app)
      .post('/api/vehicles/00000000-0000-0000-0000-000000000000/purchase')
      .set(auth);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/vehicles/:id/restock (admin only)', () => {
  beforeEach(resetDb);

  it('lets an ADMIN increase stock', async () => {
    const auth = await authHeaderFor('ADMIN');
    const vehicle = await makeVehicle(1);

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set(auth)
      .send({ quantity: 4 });
    expect(res.status).toBe(200);
    expect(res.body.vehicle.quantity).toBe(5);
  });

  it('forbids a non-admin USER from restocking (403)', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle(1);

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set(auth)
      .send({ quantity: 4 });
    expect(res.status).toBe(403);
    const after = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(after?.quantity).toBe(1);
  });

  it('returns 404 when restocking a non-existent vehicle', async () => {
    const auth = await authHeaderFor('ADMIN');
    const res = await request(app)
      .post('/api/vehicles/00000000-0000-0000-0000-000000000000/restock')
      .set(auth)
      .send({ quantity: 4 });
    expect(res.status).toBe(404);
  });
});
