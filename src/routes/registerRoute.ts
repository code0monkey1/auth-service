import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const route = Router();

const authController = new AuthController();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
route.post("/register", authController.register);

export default route;
