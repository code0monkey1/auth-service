import { AppDataSource } from "../../../config/data-source";
import { Tenant } from "../../../entity/Tenant";
import { TenantService } from "../../../services/tenant-service";

export const makeTenantService = () => {
    const tenantRepository = AppDataSource.getRepository(Tenant);

    return new TenantService(tenantRepository);
};
