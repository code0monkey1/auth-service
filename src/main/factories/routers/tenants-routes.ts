/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router, Express } from "express";
import { ROLES } from "../../../constants";
import authenticate from "../../../middleware/authenticate";
import { canAccess } from "../../../middleware/canAccess";
import { createTenantControllerFactory } from "../../../routes/controllerFactory/tenantControllerFactory";
import createTenantValidator from "../../../validators/create-tenant-validator";
import updateTenantValidator from "../../../validators/update-tenant-validator";

const tenantController = createTenantControllerFactory();

export default (app: Express): void => {
    const route = Router();

    app.use("/tenants", route);

    //tenant routes

    route.post(
        "/",
        createTenantValidator,
        authenticate,
        canAccess([ROLES.ADMIN]),
        tenantController.create,
    );
    route.get(
        "/",
        authenticate,
        canAccess([ROLES.ADMIN]),
        tenantController.get,
    );
    route.get(
        "/:id",
        authenticate,
        canAccess([ROLES.ADMIN]),
        tenantController.getById,
    );

    route.patch(
        "/:id",
        updateTenantValidator,
        authenticate,
        canAccess([ROLES.ADMIN]),
        tenantController.update,
    );

    route.delete(
        "/:id",
        authenticate,
        canAccess([ROLES.ADMIN]),
        tenantController.delete,
    );
};
