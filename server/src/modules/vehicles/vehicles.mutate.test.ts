import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, authHeaderFor } from '../../tests/helpers.js';
import { prisma } from '../../lib/prisma.js';

const app = createApp();

const makeVehicle = () =>
  prisma.vehicle.create({
    data: { make: 'Toyota', model: 'Corolla', category: 'Sedan', priceCents: 2000000, quantity: 3 },
  });

describe('PUT /api/vehicles/:id (update)', () => {
  beforeEach(resetDb);

  it('updates a vehicle for an authenticated user', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle();

    const res = await request(app)
      .put(`/api/vehicles/${vehicle.id}`)
      .set(auth)
      .send({ priceCents: 1999000, category: 'Hatchback' });

    expect(res.status).toBe(200);
    expect(res.body.vehicle).toMatchObject({ priceCents: 1999000, category: 'Hatchback' });
    expect(res.body.vehicle.make).toBe('Toyota'); // untouched field preserved
  });

  it('returns 404 for a non-existent vehicle', async () => {
    const auth = await authHeaderFor('USER');
    const res = await request(app)
      .put('/api/vehicles/00000000-0000-0000-0000-000000000000')
      .set(auth)
      .send({ priceCents: 1 });
    expect(res.status).toBe(404);
  });

  it('rejects an empty update body with 400', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle();
    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).set(auth).send({});
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/vehicles/:id (admin only)', () => {
  beforeEach(resetDb);

  it('lets an ADMIN delete a vehicle', async () => {
    const auth = await authHeaderFor('ADMIN');
    const vehicle = await makeVehicle();

    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`).set(auth);
    expect(res.status).toBe(204);
    expect(await prisma.vehicle.findUnique({ where: { id: vehicle.id } })).toBeNull();
  });

  it('forbids a non-admin USER from deleting (403)', async () => {
    const auth = await authHeaderFor('USER');
    const vehicle = await makeVehicle();

    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`).set(auth);
    expect(res.status).toBe(403);
    expect(await prisma.vehicle.findUnique({ where: { id: vehicle.id } })).not.toBeNull();
  });

  it('returns 404 when an admin deletes a non-existent vehicle', async () => {
    const auth = await authHeaderFor('ADMIN');
    const res = await request(app)
      .delete('/api/vehicles/00000000-0000-0000-0000-000000000000')
      .set(auth);
    expect(res.status).toBe(404);
  });
});
