import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, authHeaderFor } from '../../tests/helpers.js';

const app = createApp();

const sampleVehicle = {
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  priceCents: 2200000,
  quantity: 5,
};

describe('POST /api/vehicles (create)', () => {
  beforeEach(resetDb);

  it('creates a vehicle for an authenticated user', async () => {
    const auth = await authHeaderFor('USER');
    const res = await request(app).post('/api/vehicles').set(auth).send(sampleVehicle);

    expect(res.status).toBe(201);
    expect(res.body.vehicle).toMatchObject(sampleVehicle);
    expect(res.body.vehicle.id).toBeTruthy();
  });

  it('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/vehicles').send(sampleVehicle);
    expect(res.status).toBe(401);
  });

  it('rejects invalid input with 400', async () => {
    const auth = await authHeaderFor('USER');
    const res = await request(app)
      .post('/api/vehicles')
      .set(auth)
      .send({ make: '', model: 'X', category: 'Sedan', priceCents: -1, quantity: -2 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/vehicles (list)', () => {
  beforeEach(resetDb);

  it('lists all vehicles for an authenticated user', async () => {
    const auth = await authHeaderFor('USER');
    await request(app).post('/api/vehicles').set(auth).send(sampleVehicle).expect(201);
    await request(app)
      .post('/api/vehicles')
      .set(auth)
      .send({ ...sampleVehicle, model: 'Camry' })
      .expect(201);

    const res = await request(app).get('/api/vehicles').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.vehicles).toHaveLength(2);
  });

  it('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });
});
