import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");
        app.listen(Config.PORT, () => {
            logger.info(`Server running on port ${Config.PORT}`);
        });
    } catch (e: unknown) {
        let error_message = "";

        if (e instanceof Error) error_message = e.message;

        logger.error(error_message);

        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

void startServer();
