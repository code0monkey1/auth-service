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

describe("UPDATE /tenants/:id", () => {
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

        const updatedTenant = {
            ...tenant,
            name: "updated name",
        };
        //act
        await api
            .patch(`${BASE_URL}/${savedTenant.id}`)
            .send(updatedTenant)
            .expect(401);
    });

    it("should return status code 200 , when tenant with id present", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const savedTenant = await tenantRepository.save(tenant);

        const updatedTenant = {
            address: "updated address",
            name: "updated name",
        };
        //act
        const response = await api
            .patch(`${BASE_URL}/${savedTenant.id}`)
            .send(updatedTenant)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(200);

        expect(response.body.name).toBe(updatedTenant.name);
        expect(response.body.address).toBe(updatedTenant.address);
    });

    it("should return status 404 , when tenant with :id does not exist", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        const savedTenant = await tenantRepository.save(tenant);

        const updatedTenant = {
            address: "updated address",
            name: "updated name",
        };

        //act
        await api
            .patch(`${BASE_URL}/${savedTenant.id + 1}`)
            .send(updatedTenant)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(404);
        // assert
        const tenants = await tenantRepository.find();

        expect(tenants.length).toBe(1);

        expect(tenants[0].address).toBe(tenant.address);
        expect(tenants[0].name).toBe(tenant.name);
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

        const updatedTenant = {
            address: "updated address",
            name: "updated name",
        };

        //act
        await api
            .patch(`${BASE_URL}/${savedTenant.id + 1}`)
            .send(updatedTenant)
            .set("Cookie", [`accessToken=${customerToken};`])
            .expect(403);
        // assert
        const tenants = await tenantRepository.find();

        expect(tenants.length).toBe(1);
        expect(tenants[0].address).toBe(tenant.address);
        expect(tenants[0].name).toBe(tenant.name);
    });

    it("should return status 400 if id not provided in params", async () => {
        let id;
        //act
        await api
            .patch(`${BASE_URL}/${id}`)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(400);
    });
});
