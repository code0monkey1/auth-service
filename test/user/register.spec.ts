import supertest from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { ROLES } from "../../src/constants";
import bcrypt from "bcrypt";
import { isJwt } from "../utils";
import { RefreshToken } from "../../src/entity/RefreshToken";

const api = supertest(app);
const BASE_URL = "/auth";

let connection: DataSource;

describe("POST", () => {
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
        const userRepository = connection.getRepository(User);
        await userRepository.delete({});

        // const refreshTokenRepository = connection.getRepository(RefreshToken);
        // await refreshTokenRepository.delete({});
    };

    describe("when user data is valid", () => {
        it("should return status code 201", async () => {
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "12345678",
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
                password: "12345678",
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
                password: "12345678",
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
                password: "12345678",
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
                password: "12345678",
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
                password: "12345678",
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
        it("should return accessToken and refreshToken inside a cookie", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                password: "12345678",
                email: "vodsfonn@gmail.com",
            };

            //act
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(201);

            interface Headers {
                ["set-cookie"]: string[];
            }
            let accessToken = "";
            let refreshToken = "";

            // assert
            expect(response.headers["set-cookie"]).toBeDefined();

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((c) => {
                if (c.startsWith("accessToken="))
                    accessToken = c.split(";")[0].split("=")[1];

                if (c.startsWith("refreshToken="))
                    refreshToken = c.split(";")[0].split("=")[1];
            });

            expect(accessToken).toBeTruthy();
            expect(refreshToken).toBeTruthy();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it("should store the refreshToken in the database", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                password: "12345678",
                email: "vodsfonn@gmail.com",
            };
            //act
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(201);

            const refreshTokenRepo = connection.getRepository(RefreshToken);

            //assert

            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: response.body.id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe("when user data is invalid", () => {
        it("should return 400 status code , if email exists", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "b",
                email: "c",
                password: "12345678",
            };

            await connection.getRepository(User).save(user);

            const repo = await connection.getRepository(User);

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
                password: "12345678",
            };

            //act // assert
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);

            const repo = await connection.getRepository(User);
            const users = await repo.find();

            expect(response.body.errors[0].msg).toBe("email is missing");
            expect(users.length).toBe(0);
        });

        it("should return 400 when firstName is missing", async () => {
            //arrange
            const user = {
                password: "12345678",
                lastName: "b",
                email: "b",
            };

            //act // assert
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);

            const repo = await connection.getRepository(User);
            const users = await repo.find();

            expect(response.body.errors[0].msg).toBe("firstName is missing");
            expect(users.length).toBe(0);
        });
        it("should return 400 when lastName is missing", async () => {
            //arrange
            const user = {
                firstName: "a",
                email: "b",
                password: "12345678",
            };

            //act // assert
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);

            const repo = await connection.getRepository(User);
            const users = await repo.find();

            expect(response.body.errors[0].msg).toBe("lastName is missing");
            expect(users.length).toBe(0);
        });

        it("should return 400 if password is missing", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "c",
                email: "b",
            };

            //act // assert
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);

            const repo = connection.getRepository(User);
            const users = await repo.find();

            expect(response.body.errors[0].msg).toBe("password is missing");
            expect(users.length).toBe(0);
        });

        it("should trim the email id if space is there", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "c",
                email: " b@gmail.com ",
                password: "12345678",
            };

            //act
            await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(201);
            // assert
            const repo = await connection.getRepository(User);
            const users = await repo.find();

            expect(users[0].email).toBe(user.email.trim());
        });

        it("Should return 400 status code if password length is less than 8 characters.", async () => {
            //arrange
            const user = {
                firstName: "a",
                lastName: "c",
                email: " b@gmail.com ",
                password: "b",
            };

            //act
            const response = await api
                .post(BASE_URL + "/register")
                .send(user)
                .expect(400);
            // assert
            const repo = await connection.getRepository(User);
            const users = await repo.find();

            expect(response.body.errors[0].msg).toBe(
                "Password must be at least 8 characters long",
            );
            expect(users.length).toBe(0);
        });
    });
});
