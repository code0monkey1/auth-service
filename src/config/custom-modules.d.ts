declare module Express {
    interface Request {
        auth?: {
            userId?: string;
        };
    }
}
