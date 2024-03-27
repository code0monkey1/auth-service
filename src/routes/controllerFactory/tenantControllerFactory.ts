import logger from "../../config/logger";
import { TenantController } from "../../controllers/TenantController";
import { createTenantServiceFactory } from "../serviceFactory/tenantServiceFactory";

export const createTenantControllerFactory = () => {
    const tenantService = createTenantServiceFactory();

    return new TenantController(tenantService, logger);
};
