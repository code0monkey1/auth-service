import logger from "../../../config/logger";
import { UserController } from "../../../controllers/UserController";

import { makeUserService } from "../services/user-service-factory";

export const makeUserController = () => {
    const userService = makeUserService();

    return new UserController(userService, logger);
};
