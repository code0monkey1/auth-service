import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../controllers/AuthController";
import createHttpError from "http-errors";
import { RoleType } from "../constants";

export const canAccess =
    (roles = [] as RoleType[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
        try {
            const _req = req as AuthRequest;

            if (!roles.includes(_req.auth.role)) {
                const error = createHttpError(
                    403,
                    `${_req.auth.role} is not authorized`,
                );
                return next(error);
            }
            next();
        } catch (e) {
            next(e);
        }
    };
