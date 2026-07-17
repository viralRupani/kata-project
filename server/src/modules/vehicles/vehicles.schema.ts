import { z } from 'zod';

/** Body for creating a vehicle. Price is integer cents; quantity is non-negative. */
export const createVehicleSchema = z.object({
  make: z.string().min(1).max(60),
  model: z.string().min(1).max(60),
  category: z.string().min(1).max(60),
  priceCents: z.number().int().positive(),
  quantity: z.number().int().min(0),
});

/** Body for updating a vehicle — every field optional (partial update). */
export const updateVehicleSchema = createVehicleSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
);

/** Query params for search. Coerced from strings; all optional. */
export const searchVehicleSchema = z
  .object({
    make: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice,
    { message: 'minPrice must be less than or equal to maxPrice' },
  );

/** Body for purchase/restock quantity change (defaults to 1). */
export const quantitySchema = z.object({
  quantity: z.number().int().positive().default(1),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SearchVehicleQuery = z.infer<typeof searchVehicleSchema>;
