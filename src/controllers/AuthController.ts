import { NextFunction, Response } from "express";
import { RegisterRequest } from "../types";
import { UserService } from "../services/user-services";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
    ) {}

    register = async (
        req: RegisterRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { firstName, lastName, email, password } = req.body;

            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            this.logger.info(
                "Request to create user",
                JSON.stringify(req.body, null, 2),
            );

            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            //crate jwt
            const accessToken = jwt.sign({ id: user.id }, "secret");
            const refreshToken = jwt.sign({ id: user.id }, "secret");

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true, // this ensures that the cookie can be only taken by server
            });

            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true, // this ensures that the cookie can be only taken by server
            });

            this.logger.info("User has been registered", { user });

            res.status(201).json({ id: user.id });
        } catch (e) {
            next(e);
        }
    };
}
