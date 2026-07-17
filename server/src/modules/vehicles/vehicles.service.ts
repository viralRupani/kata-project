import type { Vehicle } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/app-error.js';
import type {
  CreateVehicleInput,
  SearchVehicleQuery,
  UpdateVehicleInput,
} from './vehicles.schema.js';

/** Creates a new vehicle. */
export const createVehicle = (input: CreateVehicleInput): Promise<Vehicle> =>
  prisma.vehicle.create({ data: input });

/** Returns all vehicles, newest first. */
export const listVehicles = (): Promise<Vehicle[]> =>
  prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });

/** Returns a single vehicle or throws 404. */
export const getVehicle = async (id: string): Promise<Vehicle> => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw AppError.notFound('Vehicle not found');
  return vehicle;
};

/** Updates a vehicle's fields. Throws 404 if it does not exist. */
export const updateVehicle = async (
  id: string,
  input: UpdateVehicleInput,
): Promise<Vehicle> => {
  await getVehicle(id); // 404 if missing
  return prisma.vehicle.update({ where: { id }, data: input });
};

/** Deletes a vehicle. Throws 404 if it does not exist. */
export const deleteVehicle = async (id: string): Promise<void> => {
  await getVehicle(id); // 404 if missing
  await prisma.vehicle.delete({ where: { id } });
};

/**
 * Searches vehicles by any combination of make/model/category (case-insensitive,
 * partial match) and an inclusive price range.
 */
export const searchVehicles = (query: SearchVehicleQuery): Promise<Vehicle[]> => {
  const price: { gte?: number; lte?: number } = {};
  if (query.minPrice !== undefined) price.gte = query.minPrice;
  if (query.maxPrice !== undefined) price.lte = query.maxPrice;

  return prisma.vehicle.findMany({
    where: {
      ...(query.make ? { make: { contains: query.make, mode: 'insensitive' } } : {}),
      ...(query.model ? { model: { contains: query.model, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: { contains: query.category, mode: 'insensitive' } } : {}),
      ...(price.gte !== undefined || price.lte !== undefined ? { priceCents: price } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
};
