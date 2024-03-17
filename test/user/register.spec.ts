import supertest from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { ROLES } from "../../src/constants";

const api = supertest(app);
const BASE_URL = "/auth";

describe("POST", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // clean db
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("/auth/register", () => {
        it("should return status code 201", async () => {
            await api.post(BASE_URL + "/register").expect(201);
        });

        it("should return json format data", async () => {
            await api
                .post(BASE_URL + "/register")
                .expect("Content-Type", /json/);
        });

        it("should return create a new user", async () => {
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "e",
            };
            await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect("Content-Type", /json/);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);

            //check user is the same

            expect(users[0].firstName).toBe(user.firstName);
            expect(users[0].lastName).toBe(user.lastName);
            expect(users[0].email).toBe(user.email);
        });

        it("should create the id of the user", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "e",
            };

            //act
            await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect("Content-Type", /json/);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(1);

            //check user is the same

            expect(users[0].id).toBeDefined();
        });

        it("should assign user a customer role", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "e",
            };

            //act
            await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect("Content-Type", /json/);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            //assert
            expect(users).toHaveLength(1);

            //check user is the same
            expect(users[0].role).toBe(ROLES.CUSTOMER);
        });
    });
});
