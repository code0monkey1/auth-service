import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";
import setupApp from "./config/app";
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info(" ✅ Database connected successfully  ");
        const app = setupApp();
        app.listen(Config.PORT, () => {
            logger.info(` ✅ Server listening on port ${Config.PORT}`);
        });
    } catch (e: unknown) {
        let error_message = "";

        if (e instanceof Error)
            error_message = " ❌ DB Could Not Connect" + e.message;

        logger.error(error_message);

        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

void startServer();
