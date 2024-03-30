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

describe("UPDATE /users/:id", () => {
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

    it("should return status code 200 , when updated by ADMIN", async () => {
        //act

        const userData = {
            firstName: "a",
            lastName: "b",
            email: "femail@gmail.com",
            password: "********",
            role: ROLES.MANAGER,
        };

        const userRepository = connection.getRepository(User);

        const savedUser = await userRepository.save(userData);

        const updatedUserData = {
            firstName: "updatedFirstName",
        };

        const response = await api
            .patch(BASE_URL + `/${savedUser.id}`)
            .send(updatedUserData)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(200);

        expect(response.body.firstName).toBe(updatedUserData.firstName);
        expect(response.body.email).toBe(userData.email);
    });

    it("should return status code 403 , when requested by NON - ADMIN", async () => {
        //act

        authToken = jwks_server.token({
            userId: "1",
            role: ROLES.MANAGER,
        });

        const updatedUserData = {
            firstName: "updatedFirstName",
        };

        let id;
        await api
            .patch(BASE_URL + `/${id}`)
            .send(updatedUserData)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(403);
    });

    it("should return status code 401 , when auth not provided", async () => {
        //act

        authToken = jwks_server.token({
            userId: "1",
            role: ROLES.MANAGER,
        });

        let id;
        await api.get(BASE_URL + `/${id}`).expect(401);
    });

    it("should return status code 400 , when id not provided", async () => {
        //act
        const updatedUserData = {
            firstName: "updatedFirstName",
        };

        let id;

        const response = await api
            .patch(BASE_URL + `/${id}`)
            .send(updatedUserData)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(400);

        expect(response.body.errors[0].message).toBe(
            "Missing id parameter in the request",
        );
    });

    it("should return status code 404 , when user with id not present", async () => {
        //act
        const updatedUserData = {
            firstName: "updatedFirstName",
        };

        const id = 1;

        const response = await api
            .patch(BASE_URL + `/${id}`)
            .send(updatedUserData)
            .set("Cookie", [`accessToken=${authToken};`])
            .expect(404);

        expect(response.body.errors[0].message).toBe(
            `User with id: ${id} does not exist`,
        );
    });
});
