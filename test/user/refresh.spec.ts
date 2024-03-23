import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { EncryptionService } from "../../src/services/encryption-service";
import setupApp from "../../src/config/app";
import { TokenService } from "../../src/services/token-service";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { User } from "../../src/entity/User";
import { ROLES } from "../../src/constants";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/auth/refresh";

let connection: DataSource;
let encryptionService: EncryptionService;
let tokenService: TokenService;

describe("POST /auth/refresh", () => {
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

        const refreshTokenRepository = connection.getRepository(RefreshToken);
        await refreshTokenRepository.delete({});
    };

    it("should return status 401 when sent with no refresh tokens", async () => {
        await api.post(BASE_URL).expect(401);
    });
    it("should return authToken when refresh token in cookie is valid", async () => {
        //create user that needs to be in token
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

        const refreshTokenRepository = connection.getRepository(RefreshToken);

        const tokenService = new TokenService(refreshTokenRepository);

        // create refresh token
        //save refresh token
        const newRefreshToken = await tokenService.persistRefreshToken(user);

        const refreshToken = tokenService.generateRefreshToken({
            ...jwtPayload,
            id: newRefreshToken.id,
        });

        //send refresh token
        const response = await api
            .post(BASE_URL)
            .set("Cookie", [`refreshToken=${refreshToken};`])
            .expect(200);

        expect(response.body.id).toBe(user.id);
    });
    it("should return error when refresh token in refreshCookie is invalid", async () => {
        //create user that needs to be in token
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

        const refreshTokenRepository = connection.getRepository(RefreshToken);

        const tokenService = new TokenService(refreshTokenRepository);

        // create refresh token
        //save refresh token
        const newRefreshToken = await tokenService.persistRefreshToken(user);

        const refreshToken = tokenService.generateRefreshToken({
            ...jwtPayload,
            id: newRefreshToken.id,
        });

        await tokenService.deleteRefreshToken(newRefreshToken.id);

        //send refresh token
        const response = await api
            .post(BASE_URL)
            .set("Cookie", [`refreshToken=${refreshToken};`])
            .expect(401);
    });
});
