import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie, RefreshTokenPayload } from "./utils/types";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import logger from "../config/logger";

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;

        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        try {
            // see if the refreshToken with given Id is present
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as RefreshTokenPayload).id),
                    user: {
                        id: Number(
                            (token?.payload as RefreshTokenPayload).userId,
                        ),
                    },
                },
            });

            // if refreshToken is found in the db  , send false , else send true
            return refreshToken === null;
        } catch (e) {
            const message = e instanceof Error ? e.message : "";
            logger.error(
                `Error while retrieving the refresh token : ${message}`,
                {
                    id: (token?.payload as RefreshTokenPayload).id,
                },
            );
        }
        // default , isRevoked is true
        return true;
    },
});
