import { Express } from "express";
// import tenantRoute from "../routes/tenant-route";
import authenticationRoutes from "../main/factories/routers/authentication-routes";
import tenantsRoutes from "../main/factories/routers/tenants-routes";
// import registerRoute from "../routes/register-route";
export default (app: Express): void => {
    authenticationRoutes(app);
    tenantsRoutes(app);
};
