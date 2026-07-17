import type { Request, Response } from 'express';
import {
  createVehicle,
  getVehicle,
  listVehicles,
  searchVehicles,
} from './vehicles.service.js';

/** POST /api/vehicles */
export const create = async (req: Request, res: Response) => {
  const vehicle = await createVehicle(req.body);
  res.status(201).json({ vehicle });
};

/** GET /api/vehicles */
export const list = async (_req: Request, res: Response) => {
  const vehicles = await listVehicles();
  res.status(200).json({ vehicles });
};

/** GET /api/vehicles/search */
export const search = async (req: Request, res: Response) => {
  const vehicles = await searchVehicles(req.query);
  res.status(200).json({ vehicles });
};

/** GET /api/vehicles/:id */
export const getOne = async (req: Request, res: Response) => {
  const vehicle = await getVehicle(req.params.id);
  res.status(200).json({ vehicle });
};
