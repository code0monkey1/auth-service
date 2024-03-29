/* eslint-disable @typescript-eslint/no-misused-promises */
import { Express, Router } from "express";
import authenticate from "../../../middleware/authenticate";
import { canAccess } from "../../../middleware/canAccess";
import { ROLES } from "../../../constants";
import { makeUserController } from "../controllers/user-controller-factory";

const userController = makeUserController();

export default (app: Express): void => {
    const route = Router();

    app.use("/users", route);

    // auth routes

    route.post(
        "/",
        authenticate,
        canAccess([ROLES.ADMIN]),
        userController.create,
    );
};
