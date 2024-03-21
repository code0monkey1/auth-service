import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import supertest from "supertest";
import setupApp from "../../src/config/app";
const app = setupApp();
const api = supertest(app);
import createMockJwks, { JWKSMock } from "mock-jwks";
import { ROLES } from "../../src/constants";

describe("GET /auth/self", () => {
    let connection: DataSource;
    const BASE_URL = "/auth/self";
    let jwks_server: JWKSMock;
    const JWKS_URI = "http://localhost:5555";

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks_server = createMockJwks(JWKS_URI);
    });

    beforeEach(async () => {
        jwks_server.start();
        await connection.dropDatabase();
        await connection.synchronize();
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
    };
    it("should return status code 401 , if sent without auth", async () => {
        //act
        await api.get(BASE_URL).expect(401);
    });

    it("should return response in json format", async () => {
        //act
        await api.get(BASE_URL).expect("Content-Type", /json/);
    });
    it("should return user data", async () => {
        const userData = {
            firstName: "a",
            lastName: "b",
            email: "femail@gmail.com",
            password: "********",
        };

        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: ROLES.CUSTOMER,
        });

        const jwtPayload = {
            userId: String(user.id),
            role: user.role,
        };

        const accessToken = jwks_server.token(jwtPayload);

        const response = await api
            .get("/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`]);

        expect(response.body.id).toBe(user.id);
    });

    it("should not return the password field of the user", async () => {
        const userData = {
            firstName: "a",
            lastName: "b",
            email: "femail@gmail.com",
            password: "********",
        };

        const userRepository = connection.getRepository(User);
        const user = await userRepository.save({
            ...userData,
            role: ROLES.CUSTOMER,
        });

        const jwtPayload = {
            userId: String(user.id),
            role: user.role,
        };

        const accessToken = jwks_server.token(jwtPayload);

        const response = await api
            .get("/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`]);

        expect(response.body.hashedPassword).not.toBeDefined();
    });
});
