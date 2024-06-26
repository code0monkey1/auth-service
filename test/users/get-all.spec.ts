import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import supertest from "supertest";
import setupApp from "../../src/config/app";
const app = setupApp();
const api = supertest(app);
import createMockJwks, { JWKSMock } from "mock-jwks";
import { ROLES } from "../../src/constants";
import { Tenant } from "../../src/entity/Tenant";

describe("GET /users", () => {
    let connection: DataSource;
    const BASE_URL = "/users";
    let jwks_server: JWKSMock;
    const JWKS_URI = "http://localhost:3000";
    let authToken: string;
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
        const userRepository = connection.getRepository(User);
        await userRepository.delete({});

        const tenantRepository = connection.getRepository(Tenant);
        await tenantRepository.delete({});
    };

    it("should return status code 200 , when requested by ADMIN", async () => {
        //act

        await api
            .get(BASE_URL)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(200);
    });

    it("should return status code 403 , when requested by NON - ADMIN", async () => {
        //act

        authToken = jwks_server.token({
            userId: "1",
            role: ROLES.MANAGER,
        });

        await api
            .get(BASE_URL)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(403);
    });

    it("should return status code 401 , when auth not provided", async () => {
        //act

        authToken = jwks_server.token({
            userId: "1",
            role: ROLES.MANAGER,
        });

        await api.get(BASE_URL).expect(401);
    });
});
