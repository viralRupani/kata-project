import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createVehicleSchema,
  searchVehicleSchema,
  updateVehicleSchema,
  quantitySchema,
  idParamSchema,
} from './vehicles.schema.js';
import {
  create,
  getOne,
  list,
  purchase,
  remove,
  restock,
  search,
  update,
} from './vehicles.controller.js';

export const vehiclesRouter = Router();

// All vehicle routes require authentication.
vehiclesRouter.use(authenticate);

// NOTE: /search MUST be declared before /:id, otherwise Express matches
// "search" as an :id parameter.
vehiclesRouter.get('/search', validate(searchVehicleSchema, 'query'), asyncHandler(search));

vehiclesRouter.get('/', asyncHandler(list));
vehiclesRouter.post('/', validate(createVehicleSchema), asyncHandler(create));
vehiclesRouter.get('/:id', validate(idParamSchema, 'params'), asyncHandler(getOne));

vehiclesRouter.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateVehicleSchema),
  asyncHandler(update),
);

vehiclesRouter.delete(
  '/:id',
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  asyncHandler(remove),
);

vehiclesRouter.post(
  '/:id/purchase',
  validate(idParamSchema, 'params'),
  validate(quantitySchema),
  asyncHandler(purchase),
);

vehiclesRouter.post(
  '/:id/restock',
  authorize('ADMIN'),
  validate(idParamSchema, 'params'),
  validate(quantitySchema),
  asyncHandler(restock),
);
