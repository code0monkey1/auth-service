import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
export type TenantData = {
    name: string;
    address: string;
};
export class TenantService {
    constructor(private readonly tenantRepository: Repository<Tenant>) {}

    async create(tenantData: TenantData) {
        return await this.tenantRepository.save(tenantData);
    }
}
