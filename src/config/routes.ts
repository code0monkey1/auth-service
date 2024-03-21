import { Express } from "express";
import registerRoute from "../routes/register-route";
export default (app: Express): void => {
    app.use("/auth", registerRoute);
};
