import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createVehicleSchema,
  searchVehicleSchema,
  idParamSchema,
} from './vehicles.schema.js';
import { create, getOne, list, search } from './vehicles.controller.js';

export const vehiclesRouter = Router();

// All vehicle routes require authentication.
vehiclesRouter.use(authenticate);

// NOTE: /search MUST be declared before /:id, otherwise Express matches
// "search" as an :id parameter.
vehiclesRouter.get('/search', validate(searchVehicleSchema, 'query'), asyncHandler(search));

vehiclesRouter.get('/', asyncHandler(list));
vehiclesRouter.post('/', validate(createVehicleSchema), asyncHandler(create));
vehiclesRouter.get('/:id', validate(idParamSchema, 'params'), asyncHandler(getOne));
