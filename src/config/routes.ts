import { Express } from "express";
import registerRoute from "../routes/register-route";
import tenantRoute from "../routes/tenant-route";
export default (app: Express): void => {
    app.use("/auth", registerRoute);
    app.use("/tenants", tenantRoute);
};
