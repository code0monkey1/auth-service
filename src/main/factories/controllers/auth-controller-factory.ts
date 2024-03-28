import logger from "../../../config/logger";
import { AuthController } from "../../../controllers/AuthController";
import { makeTokenService } from "../services/token-service-factory";
import { makeUserService } from "../services/user-service-factory";

export const makeAuthController = () => {
    const userService = makeUserService();
    const tokenService = makeTokenService();

    return new AuthController(userService, logger, tokenService);
};
