import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import path from "path";
import fs from "fs";
import { Config } from "../config";

export class TokenService {
    generateAccessToken = (jwtPayload: JwtPayload) => {
        //crate jwt
        //get the private key
        let privateKey: Buffer;

        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (e) {
            const error = createHttpError(
                500,
                "Error while reading private key",
            );
            throw error;
        }

        const accessToken = jwt.sign(jwtPayload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });

        return accessToken;
    };

    generateRefreshToken = (jwtPayload: JwtPayload) => {
        const refreshToken = jwt.sign(
            jwtPayload,
            Config.REFRESH_TOKEN_JWT_SECRET!,
            {
                algorithm: "HS256",
                expiresIn: "1y",
                issuer: "auth-service",
                jwtid: String(jwtPayload.id),
            },
        );

        return refreshToken;
    };
}
