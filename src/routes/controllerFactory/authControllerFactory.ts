import logger from "../../config/logger";
import { AuthController } from "../../controllers/AuthController";
import { createTokenService } from "../serviceFactory/tokenServiceFactory";
import { createUserService } from "../serviceFactory/userServiceFactory";

export const makeAuthController = () => {
    const userService = createUserService();
    const tokenService = createTokenService();

    return new AuthController(userService, logger, tokenService);
};
