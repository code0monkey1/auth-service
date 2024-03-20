/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import registerValidator from "../validators/register-validator";

import loginValidator from "../validators/login-validator";

import authenticate from "../middleware/authenticate";

import { authControllerFactor } from "./controllerFactory/authControllerFactory";

const authController = authControllerFactor();

const route = Router();

route.post("/register", registerValidator, authController.register);

route.post("/login", loginValidator, authController.login);

route.get("/self", authenticate, authController.self);

export default route;
