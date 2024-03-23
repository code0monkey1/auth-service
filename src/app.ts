import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
const app = express();

import "express-async-errors";
import cookieParser from "cookie-parser";
import registerRoute from "./routes/register-route";

app.use(cookieParser());
app.use(express.json());

app.get("/data", (req, res) => {
    res.json({ data: "will  crash again" });
});

// routes

app.use("/auth", registerRoute);

app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: HttpError, req: Request, res: Response, _next: NextFunction) => {
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

export default app;
