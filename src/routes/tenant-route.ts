/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { createTenantControllerFactory } from "./controllerFactory/tenantControllerFactory";
import authenticate from "../middleware/authenticate";

const route = Router();

const tenantController = createTenantControllerFactory();

route.post("/", authenticate, tenantController.create);

export default route;
