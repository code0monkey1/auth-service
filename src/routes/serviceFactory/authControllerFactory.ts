import logger from "../../config/logger";
import { AuthController } from "../../controllers/AuthController";
import { createTokenService } from "./tokenServiceFactory";
import { createUserService } from "./userServiceFactory";

export const authControllerFactory = () => {
    const userService = createUserService();
    const tokenService = createTokenService();

    return new AuthController(userService, logger, tokenService);
};
