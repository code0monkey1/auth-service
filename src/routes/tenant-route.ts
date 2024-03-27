/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { TenantController } from "../controllers/TenantController";

const route = Router();
const tenantController = new TenantController();

route.post("/", tenantController.register);

export default route;
