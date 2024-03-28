/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { createTenantControllerFactory } from "./controllerFactory/tenantControllerFactory";
import authenticate from "../middleware/authenticate";
import { canAccess } from "../middleware/canAccess";
import { ROLES } from "../constants";

const route = Router();

const tenantController = createTenantControllerFactory();

route.post(
    "/",
    authenticate,
    canAccess([ROLES.ADMIN]),
    tenantController.create,
);

export default route;
