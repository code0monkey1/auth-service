import { Express } from "express";
import { bodyParser } from "../main/factories/middlewares/body-parser";
import { cookieParser } from "../main/factories/middlewares/cookie-parser";
import cors from "cors";
import { Config } from ".";
import createHttpError from "http-errors";
export default (app: Express): void => {
    if (!Config.CLIENT_URL) {
        throw createHttpError(400, "Client_Url not found");
    }
    app.use(bodyParser);
    app.use(cookieParser);
    app.use(
        cors({
            origin: [Config.CLIENT_URL],
            credentials: true,
        }),
    );
};
