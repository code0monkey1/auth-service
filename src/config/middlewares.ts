import { Express } from "express";
import { bodyParser } from "../main/factories/middlewares/body-parser";
import { cookieParser } from "../main/factories/middlewares/cookie-parser";
import cors from "cors";
import { Config } from ".";

export default (app: Express): void => {
    app.use(bodyParser);
    app.use(cookieParser);
    app.use(
        cors({
            origin: [Config.CLIENT_URL!],
            credentials: true,
        }),
    );
};
