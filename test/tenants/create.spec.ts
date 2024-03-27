import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import setupApp from "../../src/config/app";
import { Tenant } from "../../src/entity/Tenant";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/tenant";

let connection: DataSource;

describe("POST /tenant", () => {
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });
    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    const clearDatabase = async () => {
        const tenantRepository = connection.getRepository(Tenant);
        await tenantRepository.delete({});

        const userRepository = connection.getRepository(User);
        await userRepository.delete({});
    };

    describe("given all fields are valid", () => {});

    it("should get 201 ok ", async () => {
        const tenant = {
            name: "name",
            address: "address",
        };

        //act
        await api.post(BASE_URL).send(tenant).expect(201);
    });
    it("should create a tenant in db", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const tenantsBefore = await tenantRepository.find();

        //act

        await api.post(BASE_URL).send(tenant).expect(201);

        //assert
        assertCreatesNewTenant(tenant, tenantsBefore);
    });
    it.todo("should not create a tenant when not set by admin");
});

async function assertCreatesNewTenant(tenant: any, tenantsBefore: any) {
    const tenantRepository = connection.getRepository(Tenant);
    const tenantsAfter = await tenantRepository.find();

    expect(tenantsAfter[tenantsAfter.length - 1].name).toBe(tenant.name);
    expect(tenantsAfter[tenantsAfter.length - 1].address).toBe(tenant.address);

    expect(tenantsAfter.length).toBe(tenantsBefore.length + 1);
}
