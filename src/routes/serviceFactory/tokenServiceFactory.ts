import { TokenService } from "../../services/token-service";
import { AppDataSource } from "../../config/data-source";
import { RefreshToken } from "../../entity/RefreshToken";
export const createTokenService = () => {
    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    return new TokenService(refreshTokenRepository);
};
