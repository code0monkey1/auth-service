import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/user-services";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";

const route = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
route.post("/register", authController.register);

export default route;
