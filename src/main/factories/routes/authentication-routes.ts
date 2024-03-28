/* eslint-disable @typescript-eslint/no-misused-promises */
import { Express, Router } from "express";
import { makeAuthController } from "../controllers/auth-controller-factory";
import authenticate from "../../../middleware/authenticate";
import parseRefreshToken from "../../../middleware/parseRefreshToken";
import validateRefreshToken from "../../../middleware/validateRefreshToken";
import loginValidator from "../../../validators/login-validator";
import registerValidator from "../../../validators/register-validator";

const authController = makeAuthController();

export default (app: Express): void => {
    const route = Router();

    app.use("/auth", route);

    // auth routes

    route.post("/register", registerValidator, authController.register);

    route.post("/login", loginValidator, authController.login);

    route.get("/self", authenticate, authController.self);

    route.post("/refresh", validateRefreshToken, authController.refresh);

    route.post(
        "/logout",
        authenticate,
        parseRefreshToken,
        authController.logout,
    );
};
