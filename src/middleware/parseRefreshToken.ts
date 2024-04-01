import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie } from "./utils/types";

export default expressjwt({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;

        return refreshToken;
    },
});
