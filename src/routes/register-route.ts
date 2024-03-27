/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import registerValidator from "../validators/register-validator";

import loginValidator from "../validators/login-validator";

import validateRefreshToken from "../middleware/validateRefreshToken";

import authenticate from "../middleware/authenticate";

import parseRefreshToken from "../middleware/parseRefreshToken";

import { authControllerFactory } from "./controllerFactory/authControllerFactory";

const authController = authControllerFactory();

// Register Router

const route = Router();

route.post("/register", registerValidator, authController.register);

route.post("/login", loginValidator, authController.login);

route.get("/self", authenticate, authController.self);

route.post("/refresh", validateRefreshToken, authController.refresh);

route.post("/logout", authenticate, parseRefreshToken, authController.logout);

export default route;
