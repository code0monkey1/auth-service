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

describe("GET /tenants", () => {
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

    it("should return status code 200 with stored tenants", async () => {
        // arrange
        const tenant = {
            name: "name",
            address: "address",
        };
        const tenantRepository = connection.getRepository(Tenant);

        await tenantRepository.save(tenant);

        //act
        const response = await api
            .get(`${BASE_URL}`)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(200);

        expect(response.body[0].name).toBe(tenant.name);
        expect(response.body[0].address).toBe(tenant.address);

        expect(response.body).toHaveLength(1);
    });
});
