import express, { Express } from "express";
import setupMiddlewares from "./middlewares";
import setupRoutes from "./routes";
import setupErrorHandler from "./error-handler";
import "reflect-metadata";

export default (): Express => {
    const app = express();
    // host the static files publically, in the public folder
    app.use(express.static("public"));
    setupMiddlewares(app);
    setupRoutes(app);
    setupErrorHandler(app);

    return app;
};
