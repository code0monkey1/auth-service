/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextFunction, Request, Response } from "express";
import { AuthRequest, CreateUserRequest, RegisterRequest } from "../types";
import { UserService } from "../services/user-services";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { TokenService } from "../services/token-service";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { User } from "../entity/User";

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
        private readonly tokenService: TokenService,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const _req = req as CreateUserRequest;

            const { firstName, lastName, email, password, role, tenantId } =
                _req.body;

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
                role,
                tenantId,
            });

            const jwtPayload = {
                userId: String(user.id),
                role: user.role,
            };

            const accessToken =
                this.tokenService.generateAccessToken(jwtPayload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...jwtPayload,
                id: newRefreshToken.id,
            });

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

            const accessToken =
                this.tokenService.generateAccessToken(jwtPayload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(userOrError);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...jwtPayload,
                id: newRefreshToken.id,
            });

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

            this.logger.info("User has logged in", { userOrError });

            res.json({ id: userOrError.id });
        } catch (e) {
            next(e);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userService.getAll();
            res.json(users);
        } catch (e) {
            next(e);
        }
    };

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            if (isNaN(Number(id))) {
                const error = createHttpError(
                    400,
                    "Missing id parameter in the request",
                );
                return next(error);
            }

            const user = await this.userService.findById(Number(id));

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

    updateById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            if (isNaN(Number(id))) {
                const error = createHttpError(
                    400,
                    "Missing id parameter in the request",
                );
                return next(error);
            }

            const updatedUser = await this.userService.updateById(
                Number(id),
                req.body as Partial<User>,
            );

            res.status(200).json(updatedUser);
        } catch (e) {
            next(e);
        }
    };

    deleteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            if (isNaN(Number(id))) {
                const error = createHttpError(
                    400,
                    "Missing id parameter in the request",
                );
                return next(error);
            }

            await this.userService.deleteById(Number(id));

            this.logger.info("User has been deleted");

            res.json({ id });
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

            const accessToken =
                this.tokenService.generateAccessToken(jwtPayload);

            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true, // this ensures that the cookie can be only taken by server
            });

            const user = await this.userService.findById(
                Number(authRequest.auth.userId),
            );

            if (!user) {
                return next(
                    createHttpError(400, "cannot find user with token"),
                );
            }

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...jwtPayload,
                id: newRefreshToken.id,
            });

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
