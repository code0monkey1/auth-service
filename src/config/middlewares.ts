import { Express } from "express";
import { bodyParser } from "../main/factories/middlewares/body-parser";
import { cookieParser } from "../main/factories/middlewares/cookie-parser";
export default (app: Express): void => {
    app.use(bodyParser);
    app.use(cookieParser);
};
