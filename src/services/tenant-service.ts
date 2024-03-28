import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";
import createHttpError from "http-errors";
export type TenantData = {
    name: string;
    address: string;
};
export class TenantService {
    constructor(private readonly tenantRepository: Repository<Tenant>) {}

    create = async (tenantData: TenantData) => {
        try {
            return await this.tenantRepository.save(tenantData);
        } catch (e) {
            const error = createHttpError(
                500,
                "failed to store the dat in the database",
            );

            throw error;
        }
    };

    findById = async (id: number) => {
        const tenant = await this.tenantRepository.findOne({ where: { id } });

        if (!tenant) {
            const error = createHttpError(
                404,
                `Tenant with id: ${id} does not exist`,
            );
            throw error;
        }

        return tenant;
    };

    find = async () => {
        return await this.tenantRepository.find();
    };

    update = async (id: number, updatedBody: Partial<TenantData>) => {
        const tenant = await this.tenantRepository.findOne({ where: { id } });

        if (!tenant) {
            const error = createHttpError(
                404,
                `Tenant with id: ${id} does not exist`,
            );
            throw error;
        }

        await this.tenantRepository.update(id, updatedBody);

        const updatedTenant = await this.tenantRepository.findOne({
            where: { id },
        });

        return updatedTenant;
    };

    delete = async (id: number) => {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
        });

        if (!tenant) {
            const error = createHttpError(
                404,
                `Tenant with id: ${id} does not exist`,
            );
            throw error;
        }

        await this.tenantRepository.delete(id);
    };
}
