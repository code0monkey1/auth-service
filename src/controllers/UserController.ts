/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextFunction, Request, Response } from "express";
import { CreateUserRequest } from "../types";
import { UserService } from "../services/user-services";
import { Logger } from "winston";
import { validationResult } from "express-validator";

import createHttpError from "http-errors";
import { User } from "../entity/User";

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger,
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

            this.logger.info("User has been registered", { user });

            res.status(201).json({ id: user.id });
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
}
