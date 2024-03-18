import supertest from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { ROLES } from "../../src/constants";
import bcrypt from "bcrypt";

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
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "e",
            };
            await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(201);
        });

        it("should return json format data", async () => {
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

        it("should store hashed password in the database", async () => {
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

            expect(users[0].hashedPassword).toBeDefined();

            expect(
                await bcrypt.compare(user.password, users[0].hashedPassword),
            ).toBeTruthy();
        });

        it("should return 400 status code , if email exists", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "p",
            };

            await connection.getRepository(User).save(user);

            const repo = connection.getRepository(User);

            const usersBefore = await repo.find();

            //act // assert
            await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);

            const usersAfter = await repo.find();

            expect(usersBefore.length).toBe(usersAfter.length);
        });
        it("should return 400 status code , if email not in request", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                password: "p",
            };

            //act // assert
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);

            const repo = connection.getRepository(User);
            const users = await repo.find();

            expect(users.length).toBe(0);
            expect(response.body.errors[0].msg).toBe("email is missing");
        });
    });
});
