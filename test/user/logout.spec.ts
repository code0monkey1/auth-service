import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import setupApp from "../../src/config/app";
import { ROLES } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { TokenService } from "../../src/services/token-service";
import createMockJwks, { JWKSMock } from "mock-jwks";
import { JwtPayload } from "jsonwebtoken";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/auth/logout";
let connection: DataSource;

let jwks_server: JWKSMock;
const JWKS_URI = "http://localhost:3000";

describe("POST /auth/logout", () => {
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

    it("should return 401 unauthorized , in case an token is not supplied", async () => {
        //send refresh token
        await api.post(BASE_URL).expect(401);
    });

    it("should delete the refresh token entry after logout ", async () => {
        //create user that needs to be in token
        const userData = getUserData();

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

        const refreshToken = await createRefreshToken(user, jwtPayload);

        const refreshTokenRepository = connection.getRepository(RefreshToken);

        const refreshTokensBefore = await refreshTokenRepository.find();

        //send refresh token
        await api
            .post(BASE_URL)
            .set("Cookie", [
                `accessToken=${accessToken}; refreshToken=${refreshToken};`,
            ])
            .expect(200);

        const refreshTokensAfter = await refreshTokenRepository.find();

        assertRefreshTokenWasDeleted(refreshTokensBefore, refreshTokensAfter);
    });
});

async function createRefreshToken(user: User, jwtPayload: JwtPayload) {
    const refreshTokenRepository = connection.getRepository(RefreshToken);

    const tokenService = new TokenService(refreshTokenRepository);

    const newRefreshToken = await tokenService.persistRefreshToken(user);

    const refreshToken = tokenService.generateRefreshToken({
        ...jwtPayload,
        id: newRefreshToken.id,
    });

    return refreshToken;
}

async function assertRefreshTokenWasDeleted(
    tokensBefore: any,
    tokensAfter: any,
) {
    expect(tokensBefore.length).toBe(1);
    expect(tokensAfter.length).toBe(0);
}

function getUserData() {
    const userData = {
        firstName: "a",
        lastName: "b",
        email: "femail@gmail.com",
        password: "********",
    };

    return userData;
}
