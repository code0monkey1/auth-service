import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { EncryptionService } from "../../src/services/encryption-service";
import { isJwt } from "../utils";
import setupApp from "../../src/config/app";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/auth/login";

let connection: DataSource;
let encryptionService: EncryptionService;

describe("POST /auth/login", () => {
    beforeAll(async () => {
        encryptionService = new EncryptionService();
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
    };
    describe("when client is valid", () => {
        it("should return status code 200", async () => {
            //arrange

            const user = {
                email: "vonnaden@gmail.com",
                password: "whatever",
            };

            const userRepository = AppDataSource.getRepository(User);

            const hashedPassword = await encryptionService.getEncryptedHash(
                user.password,
            );

            await userRepository.save({
                email: user.email,
                hashedPassword,
            });

            //act
            await api.post(BASE_URL).send(user).expect(200);

            //assert
        });

        it("should return response in json format", async () => {
            //arrange

            const user = {
                email: "vonnaden@gmail.com",
                password: "whatever",
            };

            const userRepository = AppDataSource.getRepository(User);

            const hashedPassword = await encryptionService.getEncryptedHash(
                user.password,
            );

            await userRepository.save({
                email: user.email,
                hashedPassword,
            });

            //act
            await api.post(BASE_URL).send(user).expect("Content-Type", /json/);

            //assert
        });

        it("should return accessToken and refreshToken inside a cookie", async () => {
            //arrange

            const user = {
                email: "vonnaden@gmail.com",
                password: "whatever",
            };

            const userRepository = AppDataSource.getRepository(User);

            const hashedPassword = await encryptionService.getEncryptedHash(
                user.password,
            );

            await userRepository.save({
                email: user.email,
                hashedPassword,
            });

            //act
            const response = await api.post(BASE_URL).send(user).expect(200);

            //assert
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
    });

    describe("when client is invalid", () => {
        it("should return 400 status when missing fields", async () => {
            //arrange
            const user = {
                password: "12345678",
            };

            //act // assert
            await api.post(BASE_URL).send(user).expect(400);
        });

        it("should return status 400 with password is incorrect", async () => {
            const user = {
                email: "vonnaden@gmail.com",
                password: "whatever",
            };

            const userRepository = AppDataSource.getRepository(User);

            const hashedPassword = await encryptionService.getEncryptedHash(
                user.password,
            );

            await userRepository.save({
                email: user.email,
                hashedPassword,
            });

            //act
            await api
                .post(BASE_URL)
                .send({ ...user, password: "different_password" })
                .expect(400);

            //assert
        });

        it("should return status 400 when user email not already registered", async () => {
            //arrange

            const user = {
                email: "vonnaden@gmail.com",
                password: "whatever",
            };

            //act
            //assert
            await api.post(BASE_URL).send(user).expect(400);
        });

        it("should return status 400 when email not sent in request body", async () => {
            //arrange

            const user = {
                password: "whatever",
            };

            //act
            //assert
            await api.post(BASE_URL).send(user).expect(400);
        });

        it("should return status 401 when  password not sent in request body", async () => {
            //arrange

            const user = {
                email: "vonnaden@gmail.com",
            };

            //act
            //assert
            await api.post(BASE_URL).send(user).expect(400);
        });
    });
});
