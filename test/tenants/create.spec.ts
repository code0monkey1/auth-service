import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import setupApp from "../../src/config/app";
import { Tenant } from "../../src/entity/Tenant";
import createMockJwks, { JWKSMock } from "mock-jwks";
import { ROLES } from "../../src/constants";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/tenant";

let connection: DataSource;
let jwks_server: JWKSMock;
const JWKS_URI = "http://localhost:3000";
let authToken: string;

describe("POST /tenant", () => {
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks_server = createMockJwks(JWKS_URI);
    });

    beforeEach(async () => {
        jwks_server.start();
        await connection.dropDatabase();
        await connection.synchronize();

        authToken = jwks_server.token({
            userId: "1",
            role: ROLES.ADMIN,
        });
    });

    afterEach(async () => {
        await clearDatabase();
        jwks_server.stop();
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
        await api
            .post(BASE_URL)
            .set("Cookie", [`accessToken=${authToken};`])
            .send(tenant)
            .expect(201);
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

        await api
            .post(BASE_URL)
            .set("Cookie", [`accessToken=${authToken};`])
            .send(tenant)
            .expect(201);

        //assert
        assertCreatesNewTenant(tenant, tenantsBefore);
    });
    it("should return 401 if user is not authenticated", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        //act

        await api.post(BASE_URL).send(tenant).expect(401);

        // assert
        const tenants = await tenantRepository.find();

        expect(tenants.length).toBe(0);
    });

    it("should return 403 if user is not an ADMIN ", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        //act
        const customerToken = jwks_server.token({
            userId: "1",
            role: ROLES.CUSTOMER,
        });

        await api
            .post(BASE_URL)
            .set("Cookie", [`accessToken=${customerToken};`])
            .send(tenant)
            .expect(403);

        // assert
        const tenants = await tenantRepository.find();

        expect(tenants).toHaveLength(0);
    });
});

async function assertCreatesNewTenant(tenant: any, tenantsBefore: any) {
    const tenantRepository = connection.getRepository(Tenant);
    const tenantsAfter = await tenantRepository.find();

    expect(tenantsAfter.length).toBeGreaterThan(0);

    expect(tenantsAfter[tenantsAfter.length - 1].name).toBe(tenant.name);
    expect(tenantsAfter[tenantsAfter.length - 1].address).toBe(tenant.address);

    expect(tenantsAfter.length).toBe(tenantsBefore.length + 1);
}
