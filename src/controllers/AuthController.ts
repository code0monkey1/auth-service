/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextFunction, Request, Response } from "express";
import { AuthRequest, RegisterRequest } from "../types";
import { UserService } from "../services/user-services";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { TokenService } from "../services/token-service";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { ROLES } from "../constants";

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
    ) {}

    register = async (
        req: RegisterRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { firstName, lastName, email, password, tenantId } = req.body;

            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            this.logger.info(
                "Request to create user",
                JSON.stringify(
                    { ...req.body, password: password ? "****" : null },
                    null,
                    2,
                ),
            );

            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: ROLES.CUSTOMER,
                tenantId,
            });

            const jwtPayload = {
                userId: String(user.id),
                role: user.role,
            };

            await this.tokenService.setRefreshToken(res, jwtPayload, user);

            this.tokenService.setAccessToken(res, jwtPayload);

            this.logger.info("User has been registered", { user });

            res.status(201).json({ id: user.id });
        } catch (e) {
            next(e);
        }
    };

    login = async (req: RegisterRequest, res: Response, next: NextFunction) => {
        try {
            const result = validationResult(req);

            if (!result.isEmpty()) {
                return res.status(400).json({ errors: result.array() });
            }

            const { email, password } = req.body;

            this.logger.info(
                "Request to login user",
                JSON.stringify(
                    { ...req.body, password: password ? "****" : null },
                    null,
                    2,
                ),
            );

            const userOrError = await this.userService.findByEmailAndPassword(
                email,
                password,
            );

            if (userOrError instanceof Error) {
                next(userOrError);
                return;
            }

            const jwtPayload: JwtPayload = {
                userId: String(userOrError.id),
                role: userOrError.role,
            };

            await this.tokenService.setRefreshToken(
                res,
                jwtPayload,
                userOrError,
            );

            this.tokenService.setAccessToken(res, jwtPayload);

            this.logger.info("User has logged in", { userOrError });

            res.json({ id: userOrError.id });
        } catch (e) {
            next(e);
        }
    };

    self = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authRequest = req as AuthRequest;

            const userId = Number(authRequest?.auth?.userId);

            const user = await this.userService.findById(userId);

            if (!user) {
                const error = createHttpError(404, "User not found");
                next(error);
                return;
            }

            res.json({ ...user });
        } catch (e) {
            next(e);
        }
    };

    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authRequest = req as AuthRequest;

            //delete the previous refreshToken
            await this.tokenService.deleteRefreshToken(
                Number(authRequest.auth.id),
            );

            const jwtPayload: JwtPayload = {
                userId: String(authRequest.auth.userId),
                role: authRequest.auth.role,
            };

            const user = await this.userService.findById(
                Number(authRequest.auth.userId),
            );

            if (!user) {
                return next(
                    createHttpError(400, "cannot find user with token"),
                );
            }

            await this.tokenService.setRefreshToken(res, jwtPayload, user);

            this.tokenService.setAccessToken(res, jwtPayload);

            res.json({ id: user.id });
        } catch (e) {
            next(e);
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshTokenId = Number((req as AuthRequest).auth.id);

            await this.tokenService.deleteRefreshToken(refreshTokenId);

            this.logger.info("User has been logged out", {
                id: (req as AuthRequest).auth.userId,
            });

            //clear cookies

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            res.end();
        } catch (e) {
            next(e);
        }
    };
}
