import supertest from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { EncryptionService } from "../../src/services/encryption-service";
import setupApp from "../../src/config/app";
import { TokenService } from "../../src/services/token-service";
import { RefreshToken } from "../../src/entity/RefreshToken";

const app = setupApp();
const api = supertest(app);
const BASE_URL = "/auth/refresh";

let connection: DataSource;
let encryptionService: EncryptionService;

describe("GET /auth/refresh", () => {
    it.todo("should return status 200");
    it.todo("should return authToken when refresh token in cookie is valid");
    it.todo("should return error when refresh token in cookie is invalid");
});
