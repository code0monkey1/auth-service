import { Express } from "express";
import authenticationRoutes from "../main/factories/routes/authentication-routes";
import tenantsRoutes from "../main/factories/routes/tenants-routes";
export default (app: Express): void => {
    authenticationRoutes(app);
    tenantsRoutes(app);
};
