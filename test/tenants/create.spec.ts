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
        const result = await api.post(BASE_URL).send(tenant).expect(201);
    });
    it.todo("should create a tenant when set by admin");
    it.todo("should not create a tenant when not set by admin");
});
