import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Request, Response, NextFunction } from "express";
import { Config } from "../../config";
import { isBearerToken } from ".";
import { AuthCookie } from "../types";

export interface CustomRequest extends Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
}

const client = jwksClient({
    jwksUri: Config.JWKS_URI!,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getKey = (header: any, callback: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key?.getPublicKey();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, signingKey);
    });
};

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        let token;

        const authHeader = req.headers.authorization;
        if (authHeader && isBearerToken(authHeader)) {
            token = authHeader.split(" ")[1];
        } else {
            const { accessToken } = req.cookies as AuthCookie;
            token = accessToken;
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Token is not valid" });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export default verifyToken;
