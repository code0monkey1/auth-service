import { Express, NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "./logger";
export default (app: Express) => {
    app.use(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (
            error: HttpError,
            _req: Request,
            res: Response,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            _next: NextFunction,
        ) => {
            logger.error(error.message);
            const statusCode = error.statusCode || error.status || 500;
            res.status(statusCode).json({
                errors: [
                    {
                        type: error.name,
                        message: error.message,
                        path: "",
                        location: "",
                    },
                ],
            });
        },
    );
};
