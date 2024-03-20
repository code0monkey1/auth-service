import { GetVerificationKey, expressjwt } from "express-jwt";
import jwksClient from "jwks-rsa";
import { Config } from "../config";
import { Request } from "express";
import { isBearerToken } from "./utils";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],
    getToken(req: Request) {
        // get authorization header with bearer token
        const authHeader = req.headers.authorization!;

        if (isBearerToken(authHeader)) {
            const token = authHeader.split(" ")[1];

            return token;
        }

        type AuthCookie = {
            accessToken: string;
        };

        const { accessToken } = req.cookies as AuthCookie;

        return accessToken;
    },
});
