/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { createTenantControllerFactory } from "./controllerFactory/tenantControllerFactory";

const route = Router();

const tenantController = createTenantControllerFactory();

route.post("/", tenantController.create);

export default route;
