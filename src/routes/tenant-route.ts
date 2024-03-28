/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { createTenantControllerFactory } from "./controllerFactory/tenantControllerFactory";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { ROLES } from "../constants";
import createTenantValidator from "../validators/create-tenant-validator";
const route = Router();

const tenantController = createTenantControllerFactory();

route.post(
    "/",
    createTenantValidator,
    authenticate,
    canAccess([ROLES.ADMIN]),
    tenantController.create,
);

route.get(
    "/:id",
    authenticate,
    canAccess([ROLES.ADMIN]),
    tenantController.getById,
);

export default route;
