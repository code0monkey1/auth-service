import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import setupApp from "../../src/config/app";
import { Tenant } from "../../src/entity/Tenant";
import createMockJwks, { JWKSMock } from "mock-jwks";
import { ROLES } from "../../src/constants";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/tenants";

let connection: DataSource;
let jwks_server: JWKSMock;
const JWKS_URI = "http://localhost:3000";
let authToken: string;

describe("DELETE /tenants/:id", () => {
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
    };

    it("should return 401 if user is not authenticated", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const savedTenant = await tenantRepository.save(tenant);

        //act
        await api.delete(`${BASE_URL}/${savedTenant.id}`).expect(401);
    });

    it("should delete tenant with given id ", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const savedTenant = await tenantRepository.save(tenant);

        const initialTenants = await tenantRepository.find();

        //act
        await api
            .delete(`${BASE_URL}/${savedTenant.id}`)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(200);

        const tenants = await tenantRepository.find();

        expect(initialTenants.length).toBe(1);
        expect(tenants.length).toBe(0);
    });

    it("should return status 404 , when tenant with :id does not exist", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const savedTenant = await tenantRepository.save(tenant);

        //act
        await api
            .delete(`${BASE_URL}/${savedTenant.id + 1}`)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(404);
        // assert
        const tenants = await tenantRepository.find();

        expect(tenants.length).toBe(1);
    });

    it("should return status 403 , when tenant  is not admin", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const savedTenant = await tenantRepository.save(tenant);

        const customerToken = jwks_server.token({
            userId: "1",
            role: ROLES.CUSTOMER,
        });

        //act
        await api
            .delete(`${BASE_URL}/${savedTenant.id + 1}`)
            .set("Cookie", [`accessToken=${customerToken};`])
            .expect(403);
        // assert
        const tenants = await tenantRepository.find();

        expect(tenants.length).toBe(1);
    });

    it("should  return status 400 if id not provided in params", async () => {
        let id;
        //act
        await api
            .delete(`${BASE_URL}/${id}`)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(400);
    });
});
