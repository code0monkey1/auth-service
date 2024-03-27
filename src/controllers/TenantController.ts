import { NextFunction, Request, Response } from "express";

export class TenantController {
    register = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(201).json();
        } catch (e) {
            next(e);
        }
    };
}
