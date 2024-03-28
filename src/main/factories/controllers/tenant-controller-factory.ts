import logger from "../../../config/logger";
import { TenantController } from "../../../controllers/TenantController";
import { makeTenantService } from "../services/tenant-service-factory";

export const makeTenantController = () => {
    const tenantService = makeTenantService();
    return new TenantController(tenantService, logger);
};
