import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
// import path from "path";
// import fs from "fs";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";
import { Response } from "express";

export class TokenService {
    constructor(
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {}

    generateAccessToken = (jwtPayload: JwtPayload) => {
        if (!Config.PRIVATE_KEY) {
            throw createHttpError(500, "PRIVATE_KEY not set");
        }

        const privateKey = Config.PRIVATE_KEY;

        return jwt.sign(jwtPayload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
    };

    generateRefreshToken = (jwtPayload: JwtPayload) => {
        return jwt.sign(jwtPayload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(jwtPayload.id),
        });
    };

    setAccessToken = (res: Response, jwtPayload: JwtPayload) => {
        const accessToken = this.generateAccessToken(jwtPayload);

        res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60, // 1 hour
            httpOnly: true, // this ensures that the cookie can be only taken by server
        });
    };

    setRefreshToken = async (
        res: Response,
        jwtPayload: JwtPayload,
        user: User,
    ) => {
        const newRefreshToken = await this.persistRefreshToken(user);

        const refreshToken = this.generateRefreshToken({
            ...jwtPayload,
            id: newRefreshToken.id,
        });

        res.cookie("refreshToken", refreshToken, {
            domain: "localhost",
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
            httpOnly: true, // this ensures that the cookie can be only taken by server
        });
    };

    deleteRefreshToken = async (id: number) => {
        await this.refreshTokenRepository.delete(id);
    };

    persistRefreshToken = async (user: User, years = 1) => {
        // default set to one year
        const YEARS = 1000 * 60 * 60 * 24 * 365 * years;

        return await this.refreshTokenRepository.save({
            user,
            expiresAt: new Date(Date.now() + YEARS),
        });
    };

    // can be used during development , but you'll have to pass the private key as a param during deployment

    // private getPrivateKey = () => {
    //     try {
    //         return fs.readFileSync(
    //             path.join(__dirname, "../../certs/private.pem"),
    //         );
    //     } catch (e) {
    //         const error = createHttpError(
    //             500,
    //             "Error while reading private key",
    //         );
    //         throw error;
    //     }
    // };
}
