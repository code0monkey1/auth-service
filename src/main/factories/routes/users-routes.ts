/* eslint-disable @typescript-eslint/no-misused-promises */
import { Express, Router } from "express";
import authenticate from "../../../middleware/authenticate";
import { canAccess } from "../../../middleware/canAccess";
import { ROLES } from "../../../constants";
import { makeUserController } from "../controllers/user-controller-factory";
import createUserValidator from "../../../validators/create-user-validator";

const userController = makeUserController();

export default (app: Express): void => {
    const route = Router();

    app.use("/users", route);

    // auth routes

    route.post(
        "/",
        createUserValidator,
        authenticate,
        canAccess([ROLES.ADMIN]),
        userController.create,
    );

    route.get(
        "/",
        authenticate,
        canAccess([ROLES.ADMIN]),
        userController.getAll,
    );

    route.get(
        "/:id",
        authenticate,
        canAccess([ROLES.ADMIN]),
        userController.findById,
    );

    route.patch(
        "/:id",
        authenticate,
        canAccess([ROLES.ADMIN]),
        userController.update,
    );

    route.delete(
        "/:id",
        authenticate,
        canAccess([ROLES.ADMIN]),
        userController.delete,
    );
};
