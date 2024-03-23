/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import registerValidator from "../validators/register-validator";

import loginValidator from "../validators/login-validator";

import { EncryptionService } from "../services/encryption-service";

import validateRefreshToken from "../middleware/validateRefreshToken";

import authenticate from "../middleware/authenticate";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { TokenService } from "../services/token-service";
import { UserService } from "../services/user-services";

const route = Router();

const userRepository = AppDataSource.getRepository(User);
const encryptionService = new EncryptionService();
const userService = new UserService(userRepository, encryptionService);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);

const authController = new AuthController(userService, logger, tokenService);

route.post("/register", registerValidator, authController.register);

route.post("/login", loginValidator, authController.login);

route.get("/self", authenticate, authController.self);

route.post("/refresh", validateRefreshToken, authController.refresh);

export default route;
