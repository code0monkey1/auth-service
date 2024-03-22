import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import path from "path";
import fs from "fs";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken = (jwtPayload: JwtPayload) => {
        const privateKey: Buffer = this.getPrivateKey();

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

    deleteRefreshToken = async (id: string) => {
        await this.refreshTokenRepository.delete(id);
    };

    persistRefreshToken = async (user: User) => {
        const MS_IN_YEARS = 60 * 60 * 24 * 365;

        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEARS),
        });

        return newRefreshToken;
    };

    private getPrivateKey = () => {
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
        return privateKey;
    };
}
